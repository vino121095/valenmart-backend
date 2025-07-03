const express = require('express');
const router = express.Router();
const driverDetailsController = require('../controller/driverDetailsController');
const { uploadDriverAndIdProof } = require('../middleware/multer');

router.post('/driver-details/create', uploadDriverAndIdProof, driverDetailsController.createDriver);
router.get('/driver-details/all', driverDetailsController.getAllDrivers);
router.get('/driver-details/:id', driverDetailsController.getDriverById);
router.put('/driver-details/update/:id', uploadDriverAndIdProof, driverDetailsController.updateDriver);
router.delete('/driver-details/delete/:id', driverDetailsController.deleteDriver);

//Login and Logout Driver Details
router.post('/driver-details/login', driverDetailsController.loginDriversDetails);
router.post('/driver-details/logout', driverDetailsController.logoutDriver);
router.get('/driver-log/all', driverDetailsController.getAllDriverLogs);
router.get('/driver-log/:id', driverDetailsController.getDriverLogById);

module.exports = router;