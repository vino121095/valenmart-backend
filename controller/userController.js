require('dotenv').config();

const User = require('../model/user');
const CustomerProfile = require('../model/customerProfile');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const sequelize = require('../Config/db.js');

const registerUser = async (req, res) => {
    try {
        const { username, email, password, address, phone, institution_name, institution_type, city, state, postal_code } = req.body;

        if (!username || !email || !password || !address || !phone) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if email already exists in both User and CustomerProfile
        const existingUser = await User.findOne({ where: { email } });
        const existingCustomer = await CustomerProfile.findOne({ where: { contact_person_email: email } });
        
        if (existingUser || existingCustomer) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Start a transaction
        const result = await sequelize.transaction(async (t) => {
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create new user
            const newUser = await User.create({
                username,
                email,
                password: hashedPassword,
                address,
                phone,
                authProvider: 'local',
            }, { transaction: t });

            // Create customer profile with the same data
            const newCustomerProfile = await CustomerProfile.create({
                user_id: newUser.uid,
                institution_name: institution_name, // Using username as institution name
                institution_type: institution_type || 'Individual', // Default type
                address,
                city: city || 'Not specified', // Default value
                state: state || 'Not specified', // Default value
                postal_code: postal_code || '000000', // Default value
                contact_person_name: username,
                contact_person_email: email,
                contact_person_phone: phone,
                password: hashedPassword
            }, { transaction: t });

            return { newUser, newCustomerProfile };
        });

        // Set up Nodemailer
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'vinothini1.deecodes@gmail.com',
                pass: 'fksv xyol plxg gcsv',  // Consider using environment variables for security
            },
        });

        // Email options
        const mailOptions = {
            from: 'vinothini1.deecodes@gmail.com',
            to: email,
            subject: 'Welcome to Our Service',
            text: `
            Hello ${username},
            Welcome to Our Platform!
            Your account has been successfully registered.
            You can now use both user and customer features.
            Warm regards,
            Our Team`,
        };

        // Send email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({ 
                    message: 'User and customer profile created but failed to send email', 
                    error: error.message,
                    data: {
                        user: result.newUser,
                        customerProfile: result.newCustomerProfile
                    }
                });
            }

            console.log('Email sent: ' + info.response);
            return res.status(201).json({ 
                message: 'User and customer profile created successfully and email sent',
                data: {
                    user: result.newUser,
                    customerProfile: result.newCustomerProfile
                }
            });
        });

    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate a password reset token
        const token = crypto.randomBytes(32).toString('hex');

        // Save the token and its expiration time (e.g., 1 hour) in the user record
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Set up Nodemailer
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'vinothini1.deecodes@gmail.com',
                pass: 'yjzv jhgr uphu cfns', // Use environment variables for security
            },
        });

        // Email options
        const mailOptions = {
            from: 'vinothini1.deecodes@gmail.com',
            to: email,
            subject: 'Password Reset Request',
            text: `
            You requested a password reset. Click the link below to reset your password:
            ${token}
            If you did not request this, please ignore this email.
            `,
        };

        // Send email
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Password reset link sent to your email' });
    } catch (error) {
        console.error('Error in forgot password:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, newpassword } = req.body;

        if (!token || !newpassword) {
            return res.status(400).json({ message: "Token and new password are required" });
        }

        // Find user by reset token
        const user = await User.findOne({ where: { resetPasswordToken: token } });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        // Check if token is expired
        if (new Date(user.resetPasswordExpires) < new Date()) {
            return res.status(400).json({ message: "Token has expired" });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newpassword, 10);

        // Update password and remove reset token
        await User.update(
            { password: hashedPassword, resetPasswordToken: null, resetPasswordExpires: null },
            { where: { uid: user.uid } }
        );

        res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get all users
const getUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUsersWithCustomerProfile = async (req, res) => {
    try {
        const users = await User.findAll({
            include: [{
                model: CustomerProfile,
                attributes: ['state', 'city', 'postal_code', 'institution_name', 'institution_type']
            }]
        });
        
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user by ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Edit user
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, phone, password, address } = req.body;

        // Find user by ID
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Hash password if updated
        let hashedPassword = user.password;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        // Update profile image only if a new file is uploaded
        let profileImage = user.profile_image;
        if (req.file) {
            // For local storage, we only need the file path
            profileImage = req.file.path;
        }

        // Update user details
        await user.update({
            username: username || user.username,
            email: email || user.email,
            phone: phone || user.phone,
            password: hashedPassword,
            address: address || user.address,
            profile_image: profileImage,
        });

        res.status(200).json({
            message: 'User updated successfully',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                address: user.address,
                profile_image: user.profile_image,
                // Don't include password in response
            }
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


// Delete user
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.destroy();
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const generateAccessToken = async (user) => {
    const token = jwt.sign(user, process.env.ACCESS_SECRET_TOKEN, { expiresIn: "2h" });
    return token;
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Compare the password with the hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Optional: Create a token for authentication
        const token = jwt.sign({ uid: user.uid, email: user.email }, 'your_jwt_secret', { expiresIn: '1h' });
        const userData = {
            uid: user.uid,
            username: user.username,
            email: user.email
        }
        res.status(200).json({ message: 'Login successful', token, userData });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// Passport Serialization
passport.serializeUser((user, done) => {
    done(null, user.uid);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:8000/auth/google/callback",
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ where: { googleId: profile.id } });
        if (!user) {
            user = await User.create({
                username: profile.displayName,
                email: profile.emails[0].value,
                googleId: profile.id,
                authProvider: 'google'
            });
        }
        done(null, user);
    } catch (error) {
        done(error, null);
    }
}));

// Facebook Strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: "http://localhost:8000/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'emails']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ where: { facebookId: profile.id } });
        if (!user) {
            user = await User.create({
                username: profile.displayName,
                email: profile.emails[0].value,
                facebookId: profile.id,
                authProvider: 'facebook'
            });
        }
        done(null, user);
    } catch (error) {
        done(error, null);
    }
}));

// Google Login
const googleLogin = (req, res, next) => {
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
};

// Google Callback
const googleCallback = (req, res, next) => {
    passport.authenticate('google', { failureRedirect: '/login' }, (err, user) => {
        if (err || !user) {
            return res.redirect('/login');
        }
        const token = generateAccessToken({ uid: user.uid, email: user.email });
        res.status(200).json({ message: 'Google login successful', token });
    })(req, res, next);
};

// Facebook Login
const facebookLogin = (req, res, next) => {
    passport.authenticate('facebook', { scope: ['email'] })(req, res, next);
};

// Facebook Callback
const facebookCallback = (req, res, next) => {
    passport.authenticate('facebook', { failureRedirect: '/login' }, (err, user) => {
        if (err || !user) {
            return res.redirect('/login');
        }
        const token = generateAccessToken({ uid: user.uid, email: user.email });
        res.status(200).json({ message: 'Facebook login successful', token });
    })(req, res, next);
};


module.exports = {
    registerUser,
    loginUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    forgotPassword,
    resetPassword,
    googleLogin,
    googleCallback,
    facebookLogin,
    facebookCallback,
    getUsersWithCustomerProfile
}