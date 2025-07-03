const express = require('express');
const router = express.Router();
const farmerController = require('../controller/farmerController');

router.post('/farmer/create', farmerController.createFarmer);
router.get('/farmer/all', farmerController.getFarmers);
router.get('/farmer/:id', farmerController.getFarmerById);
router.put('/farmer/update/:id', farmerController.updateFarmer);
router.delete('/farmer/delete/:id', farmerController.deleteFarmer);

//Login Farmer
router.post('/farmer/login', farmerController.loginFarmer);

module.exports = router;