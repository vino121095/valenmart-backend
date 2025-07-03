const express = require('express');
const router = express.Router();
const vendorSubmissionController = require('../controller/vendorSubmissionController');

router.post('/vendor-submission/create', vendorSubmissionController.createVendorSubmission);
router.get('/vendor-submission/all', vendorSubmissionController.getAllVendorSubmissions);
router.get('/vendor-submission/:id', vendorSubmissionController.getVendorSubmissionById);
router.put('/vendor-submission/update/:id', vendorSubmissionController.updateVendorSubmission);
router.delete('/vendor-submission/delete/:id', vendorSubmissionController.deleteVendorSubmission);

module.exports = router;