const express = require('express');
const router = express.Router();
const orderItemsController = require('../controller/orderItemsController');

router.post('/order-items/create', orderItemsController.createOrderItem);
router.get('/order-items/all', orderItemsController.getAllOrderItems);
router.get('/order-items/:id', orderItemsController.getOrderItemById);
router.put('/order-items/update/:id', orderItemsController.updateOrderItem);
router.delete('/order-items/delete/:id', orderItemsController.deleteOrderItem);

module.exports = router;