const express = require('express');
const router = express.Router();
const deliveryController = require('../controller/deliveryController');
const { uploadDeliveryStatusImage } = require('../middleware/multer');

router.post('/delivery/create', deliveryController.createDelivery);
router.get('/delivery/all', deliveryController.getAllDeliveries);
router.get('/delivery/:id', deliveryController.getDeliveryById);
router.get('/delivery/get-delivery/:id', deliveryController.getDeliveryByOrderId);
router.put('/delivery/update/:id', uploadDeliveryStatusImage, deliveryController.updateDelivery);
router.delete('/delivery/delete/:id', deliveryController.deleteDelivery);
router.put('/delivery/mark-delivered/:id', uploadDeliveryStatusImage, deliveryController.markAsDeliveredWithImage);

module.exports = router;