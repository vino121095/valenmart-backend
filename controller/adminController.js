const Admin = require('../model/admin'); 
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Admin registration
const admin = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: 'Validation errors',
                errors: errors.array(),
            });
        }

        const { username, email, password } = req.body;
        const isExistUser = await Admin.findOne({ where: { email } });
        if (isExistUser) {
            return res.status(400).json({
                success: false,
                msg: 'Email already exists!',
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = await Admin.create({
            username,
            email,
            password: hashedPassword,
        });

        return res.status(201).json({
            success: true,
            msg: 'Registered Successfully!',
            data: {
                username: newAdmin.username,
                email: newAdmin.email,
                aid: newAdmin.aid,
                createdAt: newAdmin.createdAt,
                updatedAt: newAdmin.updatedAt,
            },
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: 'An error occurred',
            error: error.message,
        });
    }
};

// Generate access token
const generateAccessToken = (newAdmin) => {
    return jwt.sign(newAdmin, process.env.ACCESS_SECRET_TOKEN, { expiresIn: "2h" });
};


// Admin login
const adminLogin = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: 'Validation errors',
                errors: errors.array(),
            });
        }

        const { email, password } = req.body;
        const adminData = await Admin.findOne({ where: { email } });

        if (!adminData) {
            return res.status(400).json({
                success: false,
                msg: 'Email & Password are incorrect!',
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, adminData.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                success: false,
                msg: 'Email & Password are incorrect!',
            });
        }

        const accessToken = generateAccessToken({ aid: adminData.aid, email: adminData.email });
        return res.status(200).json({
            success: true,
            msg: 'Login Successfully!',
            accessToken,
            tokenType: 'Bearer',
            data: {
                email: adminData.email,
                aid: adminData.aid,
                createdAt: adminData.createdAt,
                updatedAt: adminData.updatedAt,
            },
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message,
        });
    }
};

const verifyAdminToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                msg: 'Access token is required'
            });
        }

        const token = authHeader.split(' ')[1];
        
        jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    success: false,
                    msg: 'Invalid or expired token'
                });
            }
            
            // Attach admin info to request object
            req.admin = decoded;
            next();
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: 'Authentication error',
            error: error.message
        });
    }
};

const getAdminProfile = async (req, res) => {
    try {
        // The admin ID is extracted from the JWT token in the auth middleware
        const adminId = req.admin.aid;
        
        const adminData = await Admin.findByPk(adminId, {
            attributes: ['aid', 'username', 'email', 'createdAt', 'updatedAt']
        });
        
        if (!adminData) {
            return res.status(404).json({
                success: false,
                msg: 'Admin not found',
            });
        }
        
        return res.status(200).json({
            success: true,
            msg: 'Admin profile retrieved successfully',
            data: adminData
        });
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: 'An error occurred while fetching admin profile',
            error: error.message
        });
    }
};

// Update admin profile
const updateAdminProfile = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: 'Validation errors',
                errors: errors.array(),
            });
        }
        
        // The admin ID is extracted from the JWT token in the auth middleware
        const adminId = req.admin.aid;
        const { username, email } = req.body;
        
        // Check if admin exists
        const adminData = await Admin.findByPk(adminId);
        if (!adminData) {
            return res.status(404).json({
                success: false,
                msg: 'Admin not found',
            });
        }
        
        // Check if email already exists (if the email is changed)
        if (email !== adminData.email) {
            const emailExists = await Admin.findOne({ 
                where: { email },
                attributes: ['aid']
            });
            
            if (emailExists && emailExists.aid !== adminId) {
                return res.status(400).json({
                    success: false,
                    msg: 'Email already exists',
                });
            }
        }
        
        // Update admin profile
        adminData.username = username;
        adminData.email = email;
        await adminData.save();
        
        // Generate new token with updated info
        const accessToken = jwt.sign(
            { aid: adminData.aid, email: adminData.email },
            process.env.ACCESS_SECRET_TOKEN,
            { expiresIn: "2h" }
        );
        
        return res.status(200).json({
            success: true,
            msg: 'Profile updated successfully',
            accessToken,
            tokenType: 'Bearer',
            data: {
                username: adminData.username,
                email: adminData.email,
                aid: adminData.aid,
                createdAt: adminData.createdAt,
                updatedAt: adminData.updatedAt,
            },
        });
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: 'An error occurred while updating profile',
            error: error.message
        });
    }
};

// Add this to your adminController.js file
const changeAdminPassword = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: 'Validation errors',
                errors: errors.array(),
            });
        }

        // The admin ID is extracted from the JWT token in the auth middleware
        const adminId = req.admin.aid;
        const { newPassword, confirmPassword } = req.body;

        // Check if passwords match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                msg: 'Passwords do not match',
            });
        }

        // Find admin by ID
        const adminData = await Admin.findByPk(adminId);
        if (!adminData) {
            return res.status(404).json({
                success: false,
                msg: 'Admin not found',
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the password
        adminData.password = hashedPassword;
        await adminData.save();

        return res.status(200).json({
            success: true,
            msg: 'Password updated successfully',
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: 'An error occurred while updating password',
            error: error.message
        });
    }
};


module.exports = {
    admin,
    adminLogin,
    getAdminProfile,
    updateAdminProfile,
    verifyAdminToken,
    changeAdminPassword
};
