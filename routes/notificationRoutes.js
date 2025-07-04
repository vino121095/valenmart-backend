const express = require('express');
const router = express.Router();
const notificationController = require('../controller/notificationController');


//Notification Routes
router.get('/notification/all/:id', notificationController.getNotification);
router.get('/vendor-notification/all/:id', notificationController.getVendorNotification);
router.get('/driver-notification/all/:id', notificationController.getDriverNotification);
router.get('/admin-notification/all/:id', notificationController.getNotificationAdmin);
router.put('/notification/mark-read/:id', notificationController.markAsRead);
router.put('/vendor-notification/mark-read/:id', notificationController.vendorMarkAsRead);
router.put('/driver-notification/mark-read/:id', notificationController.driverMarkAsRead);
router.put('/admin-notification/mark-read/:id', notificationController.markAsReadAdmin);

module.exports = router;