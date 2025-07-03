const express = require('express');
const router = express.Router();
const customerProfileController = require('../controller/customerProfileController');

router.post('/customer-profile/create', customerProfileController.createCustomerProfile);
router.get('/customer-profile/all', customerProfileController.getAllCustomerProfiles);
router.get('/customer-profile/:id', customerProfileController.getCustomerProfileById);
router.put('/customer-profile/update/:id', customerProfileController.updateCustomerProfile);
router.delete('/customer-profile/delete/:id', customerProfileController.deleteCustomerProfile);

//Login Vendor
router.post('/customer-profile/login', customerProfileController.loginCustomerProfile);

module.exports = router;