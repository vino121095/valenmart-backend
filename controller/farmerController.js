const bcrypt = require('bcrypt');
const Farmer = require('../model/farmer'); 
const jwt = require('jsonwebtoken');

// Create a new Farmer
const createFarmer = async (req, res) => {
  try {
    const { 
      user_id, 
      farmer_name, 
      contact_person, 
      email, 
      password, 
      phone, 
      address, 
      city, 
      state, 
      pincode, 
      registration_date, 
      status, 
      performance_rating, 
      notes 
    } = req.body;

    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, 10);

    const newFarmer = await Farmer.create({
      user_id,
      farmer_name,
      contact_person,
      email,
      password: hashedPassword, // Store the hashed password
      phone,
      address,
      city,
      state,
      pincode,
      registration_date,
      status,
      performance_rating,
      notes
    });

    return res.status(201).json({
      success: true,
      message: 'Farmer created successfully',
      data: newFarmer
    });
  } catch (error) {
    console.error('Error creating farmer:', error);
    return res.status(500).json({ success: false, message: 'Validation error' });
  }
};

// Get all Farmers
const getFarmers = async (req, res) => {
  try {
    const farmers = await Farmer.findAll();
    return res.status(200).json({
      success: true,
      data: farmers
    });
  } catch (error) {
    console.error('Error fetching farmers:', error);
    return res.status(500).json({ success: false, message: 'Error fetching farmers' });
  }
};

// Get Farmer by ID
const getFarmerById = async (req, res) => {
  const { id } = req.params;
  try {
    const farmer = await Farmer.findByPk(id);

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: `Farmer with id ${id} not found`
      });
    }

    return res.status(200).json({
      success: true,
      data: farmer
    });
  } catch (error) {
    console.error('Error fetching farmer by ID:', error);
    return res.status(500).json({ success: false, message: 'Error fetching farmer' });
  }
};

// Update Farmer by ID
const updateFarmer = async (req, res) => {
  const { id } = req.params;
  const { 
    farmer_name, 
    contact_person, 
    email, 
    password, 
    phone, 
    address, 
    city, 
    state, 
    pincode, 
    registration_date, 
    status, 
    performance_rating, 
    notes 
  } = req.body;

  try {
    // Check if the farmer exists
    const farmer = await Farmer.findByPk(id);

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: `Farmer with id ${id} not found`
      });
    }

    // Hash the password if it's provided
    let hashedPassword = farmer.password; // Keep the old password if not updated
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Update the farmer's details
    await farmer.update({
      farmer_name,
      contact_person,
      email,
      password: hashedPassword,
      phone,
      address,
      city,
      state,
      pincode,
      registration_date,
      status,
      performance_rating,
      notes
    });

    return res.status(200).json({
      success: true,
      message: 'Farmer updated successfully',
      data: farmer
    });
  } catch (error) {
    console.error('Error updating farmer:', error);
    return res.status(500).json({ success: false, message: 'Error updating farmer' });
  }
};

// Delete Farmer by ID
const deleteFarmer = async (req, res) => {
  const { id } = req.params;

  try {
    const farmer = await Farmer.findByPk(id);

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: `Farmer with id ${id} not found`
      });
    }

    await farmer.destroy();

    return res.status(200).json({
      success: true,
      message: `Farmer with id ${id} deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting farmer:', error);
    return res.status(500).json({ success: false, message: 'Error deleting farmer' });
  }
};

// Login a farmer with email and password
const loginFarmer = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the farmer by email
    const farmer = await Farmer.findOne({ where: { email } });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    // Compare the password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, farmer.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token after successful login
    const token = jwt.sign(
      { id: farmer.id, email: farmer.email },
      'your-secret-key', // You should keep this secret safe and use environment variables
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    // Send the response with the token
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        farmer: {
          id: farmer.id,
          email: farmer.email,
          farmer_name: farmer.farmer_name,
          contact_person: farmer.contact_person,
          phone: farmer.phone,
          address: farmer.address,
          city: farmer.city,
          state: farmer.state,
          pincode: farmer.pincode,
          registration_date: farmer.registration_date,
          status: farmer.status,
          performance_rating: farmer.performance_rating,
          notes: farmer.notes
        }
      }
    });
  } catch (error) {
    console.error('Error logging in farmer:', error);
    return res.status(500).json({ success: false, message: 'Error logging in farmer' });
  }
};

module.exports = {
  createFarmer,
  getFarmers,
  getFarmerById,
  updateFarmer,
  deleteFarmer,
  loginFarmer
};
