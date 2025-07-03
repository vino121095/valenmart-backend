const express = require('express');
const router = express.Router();
const procurementController = require('../controller/procurementController');
const { uploadProcurementProductImage } = require('../middleware/multer')

router.post('/procurement/create', uploadProcurementProductImage, procurementController.createProcurement);
router.get('/procurement/all', procurementController.getAllProcurement);
router.get('/procurement/:id', procurementController.getProcurementById);
router.put('/procurement/update/:id', uploadProcurementProductImage, procurementController.updateProcurement);
// router.delete('/procurement/delete/:id', procurementController.deleteProcurement);

//Notification Routes
router.get('/procurement/vendor/:vendor_id', procurementController.getNotification);
// router.get('/procurement/notification/all', procurementController.getNotification);

module.exports = router; 
