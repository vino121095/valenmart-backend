const express = require('express');
const router = express.Router();
const vendorController = require('../controller/vendorController');
const { route } = require('./ordersRoutes');

router.post('/vendor/create', vendorController.createVendor);
router.get('/vendor/all', vendorController.getAllVendor);
router.get('/vendor/:id', vendorController.getVendorById);
router.put('/vendor/update/:id', vendorController.updateVendor);
router.delete('/vendor/delete/:id', vendorController.deleteVendor);

//Login Vendor
router.post('/vendor/login', vendorController.loginVendor);

module.exports = router;