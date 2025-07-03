const DriversDetails = require('../model/driversDetails');
const bcrypt = require('bcrypt');
const DriverLoginLog = require('../model/driverLoginLog');

const createDriver = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      date_of_birth,
      vehicle_type,
      vehicle_number,
      vehicle,
      license_number,
      license_expiry_date,
      phone,
      emergency_phone,
      state,
      country,
      status,
      // id_proof,
      password
    } = req.body;

    if (!first_name || !last_name || !email || !date_of_birth || !vehicle_type ||
        !vehicle_number || !vehicle || !license_number || !license_expiry_date ||
        !state || !country || !status) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!req.files || !req.files.driver_image || req.files.driver_image.length === 0) {
      return res.status(400).json({ message: 'Driver image is required' });
    }

    // let parsedIdProof;
    // try {
    //   parsedIdProof = JSON.stringify(JSON.parse(id_proof));
    // } catch {
    //   return res.status(400).json({ message: 'Invalid JSON format for id_proof' });
    // }

    const driverImagePath = req.files.driver_image[0].path.replace(/\\/g, '/');
    const id_proofImagePath = req.files.id_proof[0].path.replace(/\\/g, '/');

    const hashedPassword = await bcrypt.hash(password, 10);

    const newDriver = await DriversDetails.create({
      first_name,
      last_name,
      email,
      date_of_birth,
      vehicle_type,
      vehicle_number,
      vehicle,
      license_number,
      license_expiry_date,
      phone,
      emergency_phone,
      state,
      country,
      driver_image: driverImagePath,
      status,
      id_proof: id_proofImagePath,
      password: hashedPassword
    });

    res.status(201).json({ message: 'Driver created successfully', data: newDriver });
  } catch (error) {
    console.error('Error creating driver:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};


const getAllDrivers = async (req, res) => {
  try {
    const drivers = await DriversDetails.findAll();
    res.status(200).json({ data: drivers });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getDriverById = async (req, res) => {
  try {
    const { id } = req.params;
    const driver = await DriversDetails.findByPk(id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.status(200).json({ data: driver });
  } catch (error) {
    console.error('Error fetching driver:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const updateDriver = async (req, res) => {
  try {
    const { id } = req.params;

    // Find existing driver first
    const driver = await DriversDetails.findByPk(id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Extract fields from request body
    const {
      first_name,
      last_name,
      email,
      date_of_birth,
      vehicle_type,
      vehicle_number,
      vehicle,
      license_number,
      license_expiry_date,
      phone,
      emergency_phone,
      state,
      country,
      status,
      password
    } = req.body;

    // Handle id_proof JSON parsing if provided, else keep existing
    // let parsedIdProof = driver.id_proof;
    // if (id_proof) {
    //   try {
    //     parsedIdProof = JSON.stringify(JSON.parse(id_proof));
    //   } catch {
    //     return res.status(400).json({ message: 'Invalid JSON format for id_proof' });
    //   }
    // }

    // Handle driver_image upload, fallback to existing image if no file uploaded
    let driverImagePath = driver.driver_image; // default to existing
    if (req.files && req.files.driver_image && req.files.driver_image.length > 0) {
      driverImagePath = req.files.driver_image[0].path.replace(/\\/g, '/');
    }
    let id_proofImagePath = driver.id_proof;
    if(req.files && req.files.id_proof && req.files.id_proof.length >0){
      id_proofImagePath = req.files.id_proof[0].path.replace(/\\/g, '/');
    }

    // Prepare update data object
    const updateData = {
      first_name: first_name || driver.first_name,
      last_name: last_name || driver.last_name,
      email: email || driver.email,
      date_of_birth: date_of_birth || driver.date_of_birth,
      vehicle_type: vehicle_type || driver.vehicle_type,
      vehicle_number: vehicle_number || driver.vehicle_number,
      vehicle: vehicle || driver.vehicle,
      license_number: license_number || driver.license_number,
      license_expiry_date: license_expiry_date || driver.license_expiry_date,
      phone: phone || driver.phone,
      emergency_phone: emergency_phone || driver.emergency_phone,
      state: state || driver.state,
      country: country || driver.country,
      driver_image: driverImagePath,
      status: status || driver.status,
      id_proof: id_proofImagePath
    };

    // If password provided, hash it and add to update data
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Perform update
    await driver.update(updateData);

    res.status(200).json({ message: 'Driver updated successfully', data: driver });
  } catch (error) {
    console.error('Error updating driver:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

const deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const driver = await DriversDetails.findByPk(id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    await driver.destroy();
    res.status(200).json({ message: 'Driver deleted successfully' });
  } catch (error) {
    console.error('Error deleting driver:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

//Login DriversDetails
const loginDriversDetails = async (req, res) => {
  try {
    const { email, password } = req.body;

    const driver = await DriversDetails.findOne({ where: { email } });
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    const isMatch = await bcrypt.compare(password, driver.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const now = new Date();
    const logDate = now.toISOString().split('T')[0]; // "YYYY-MM-DD"

    // Create a new login log entry
    const loginLog = await DriverLoginLog.create({
      driver_id: driver.did,
      login_time: now,
      log_date: logDate
    });

    // Update last login time on driver record
    await driver.update({ last_login_time: now });

    res.status(200).json({
      message: 'Login successful',
      data: {
        id: driver.did,
        email: driver.email,
        login_log_id: loginLog.id // important to pass this for logout
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
};

//Logout Driver Details
const logoutDriver = async (req, res) => {
  try {
    const { login_log_id } = req.body;

    if (!login_log_id) {
      return res.status(400).json({ message: 'Missing login_log_id in request' });
    }

    const loginLog = await DriverLoginLog.findByPk(login_log_id);
    if (!loginLog) {
      return res.status(404).json({ message: 'Login session not found' });
    }

    const now = new Date();
    await loginLog.update({ logout_time: now });

    // Optionally update driver’s last_logout_time as well
    await DriversDetails.update(
      { last_logout_time: now },
      { where: { did: loginLog.driver_id } }
    );

    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getAllDriverLogs = async (req, res) => {
  try {
    const logs = await DriverLoginLog.findAll({
      include: {
        model: DriversDetails,
        as: 'driver',
        attributes: ['first_name', 'last_name', 'email', 'phone']
      },
      order: [['login_time', 'DESC']]
    });

    res.status(200).json({ data: logs });
  } catch (error) {
    console.error('Error fetching driver logs:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getDriverLogById = async (req, res) => {
  try {
    const { id } = req.params;

    const log = await DriverLoginLog.findByPk(id, {
      include: {
        model: DriversDetails,
        as: 'driver',
        attributes: ['first_name', 'last_name', 'email', 'phone']
      }
    });

    if (!log) {
      return res.status(404).json({ message: 'Driver login log not found' });
    }

    res.status(200).json({ data: log });
  } catch (error) {
    console.error('Error fetching driver log by ID:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  createDriver,
  getAllDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
  loginDriversDetails,
  logoutDriver,
  getAllDriverLogs,
  getDriverLogById
};
