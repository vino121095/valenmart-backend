const express = require('express');
const router = express.Router();
const ordersController = require('../controller/ordersController');
// const { uploadDeliveryStatusImage } = require('../middleware/multer');

//Orders Routes
router.post('/order/create', ordersController.createOrder);
router.get('/order/all', ordersController.getAllOrders);
router.get('/order/:id', ordersController.getOrderById);
router.get('/order/customer/:customer_id', ordersController.getOrdersByCustomerId);
router.put('/order/update/:id', ordersController.updateOrder);
router.delete('/order/delete/:id', ordersController.deleteOrder);



module.exports = router;