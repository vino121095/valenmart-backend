const CustomerProfile = require('../model/customerProfile');
const User = require('../model/user');
const bcrypt = require('bcrypt');
const sequelize = require('../Config/db');

// Create Customer Profile
const createCustomerProfile = async (req, res) => {
  try {
    const {
      institution_name,
      institution_type,
      address,
      city,
      state,
      postal_code,
      contact_person_name,
      contact_person_email,
      contact_person_phone,
      password
    } = req.body;

    // Start a transaction
    const result = await sequelize.transaction(async (t) => {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user first
      const newUser = await User.create({
        username: contact_person_name,
        email: contact_person_email,
        password: hashedPassword,
        address,
        phone: contact_person_phone,
        authProvider: 'local'
      }, { transaction: t });

      // Create customer profile
      const newCustomerProfile = await CustomerProfile.create({
        user_id: newUser.uid,
        institution_name,
        institution_type,
        address,
        city,
        state,
        postal_code,
        contact_person_name,
        contact_person_email,
        contact_person_phone,
        password: hashedPassword
      }, { transaction: t });

      return { newUser, newCustomerProfile };
    });

    res.status(201).json({
      message: 'Customer profile created successfully',
      data: result.newCustomerProfile
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Get All Customer Profiles
const getAllCustomerProfiles = async (req, res) => {
  try {
    const profiles = await CustomerProfile.findAll();
    res.status(200).json({ data: profiles });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get Customer Profile by ID
const getCustomerProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await CustomerProfile.findOne({
      where:{
        user_id:id
      }
    });
    if (!profile) {
      return res.status(404).json({ message: 'Customer profile not found' });
    }
    res.status(200).json({ data: profile });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update Customer Profile
const updateCustomerProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      institution_name,
      institution_type,
      address,
      city,
      state,
      postal_code,
      contact_person_name,
      contact_person_email,
      contact_person_phone,
      password
    } = req.body;

    const profile = await CustomerProfile.findByPk(id);
    if (!profile) {
      return res.status(404).json({ message: 'Customer profile not found' });
    }

    // Start a transaction
    await sequelize.transaction(async (t) => {
      // Update customer profile
      if (institution_name !== undefined) profile.institution_name = institution_name;
      if (institution_type !== undefined) profile.institution_type = institution_type;
      if (address !== undefined) profile.address = address;
      if (city !== undefined) profile.city = city;
      if (state !== undefined) profile.state = state;
      if (postal_code !== undefined) profile.postal_code = postal_code;
      if (contact_person_name !== undefined) profile.contact_person_name = contact_person_name;
      if (contact_person_email !== undefined) profile.contact_person_email = contact_person_email;
      if (contact_person_phone !== undefined) profile.contact_person_phone = contact_person_phone;
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        profile.password = hashedPassword;
      }

      await profile.save({ transaction: t });

      // Update associated user if email or password changed
      if (contact_person_email !== undefined || password) {
        const user = await User.findOne({ where: { uid: profile.user_id } });
        if (user) {
          if (contact_person_email !== undefined) user.email = contact_person_email;
          if (password) user.password = await bcrypt.hash(password, 10);
          await user.save({ transaction: t });
        }
      }
    });

    res.status(200).json({
      message: 'Customer profile updated successfully',
      data: profile
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Customer Profile
const deleteCustomerProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await CustomerProfile.findByPk(id);
    if (!profile) {
      return res.status(404).json({ message: 'Customer profile not found' });
    }

    // Start a transaction
    await sequelize.transaction(async (t) => {
      // Delete associated user
      await User.destroy({ where: { uid: profile.user_id }, transaction: t });
      // Delete customer profile
      await profile.destroy({ transaction: t });
    });

    res.status(200).json({ message: 'Customer profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login Customer Profile
const loginCustomerProfile = async (req, res) => {
  try {
    const { contact_person_email, password } = req.body;

    const profile = await CustomerProfile.findOne({ where: { contact_person_email } });

    if (!profile) {
      return res.status(404).json({ message: 'Customer profile not found' });
    }

    if (!profile.password) {
      return res.status(500).json({ message: 'Password not set for this profile' });
    }

    const isMatch = await bcrypt.compare(password, profile.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    res.status(200).json({
      message: 'Login successful',
      data: {
        id: profile.cpid,
        email: profile.contact_person_email
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createCustomerProfile,
  getAllCustomerProfiles,
  getCustomerProfileById,
  updateCustomerProfile,
  deleteCustomerProfile,
  loginCustomerProfile
};
