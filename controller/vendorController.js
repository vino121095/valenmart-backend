const Vendor = require('../model/vendor');
const bcrypt = require('bcrypt');

const createVendor = async (req, res) => {
  try {
    const { type, contact_person, email, phone, address, city, state, pincode, registration_date, status, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newVendor = await Vendor.create({
      type,
      contact_person,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      registration_date,
      status,
      password: hashedPassword
    });


    res.status(201).json({
      message: 'Vendor created successfully',
      data: newVendor
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllVendor = async (req, res) => {
  try {
    const vendors = await Vendor.findAll();
    res.status(200).json({
      message: 'Vendors retrieved successfully',
      data: vendors
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findByPk(req.params.id);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.status(200).json({
      message: 'Vendor retrieved successfully',
      data: vendor
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateVendor = async (req, res) => {
  try {
    const { type, contact_person, email, phone, address, city, state, pincode, status, password } = req.body;

    const vendor = await Vendor.findByPk(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    if (password) {
      vendor.password = await bcrypt.hash(password, 10);
    }

    vendor.type = type || vendor.type;
    vendor.contact_person = contact_person || vendor.contact_person;
    vendor.email = email || vendor.email;
    vendor.phone = phone || vendor.phone;
    vendor.address = address || vendor.address;
    vendor.city = city || vendor.city;
    vendor.state = state || vendor.state;
    vendor.pincode = pincode || vendor.pincode;
    vendor.status = status || vendor.status;

    await vendor.save();

    res.status(200).json({
      message: 'Vendor updated successfully',
      data: vendor
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByPk(req.params.id);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    await vendor.destroy();

    res.status(200).json({
      message: 'Vendor deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Login Vendor
const loginVendor = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find vendor by email
    const vendor = await Vendor.findOne({ where: { email } });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // You can generate JWT here if needed
    // const token = jwt.sign({ id: vendor.id }, 'your_secret_key', { expiresIn: '1h' });

    res.status(200).json({
      message: 'Login successful',
      data: {
        id: vendor.vendor_id,
        type: vendor.type,
        email: vendor.email,
        // token // Include this if JWT is implemented
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  createVendor,
  getAllVendor,
  getVendorById,
  updateVendor,
  deleteVendor,
  loginVendor
};