const express = require('express');
const router = express.Router();
const addToCartController = require('../controller/addToCartController');

router.post('/cart/create', addToCartController.createCartItem);
router.get('/cart/all', addToCartController.getAllCartItems);
router.get('/cart/:id', addToCartController.getCartItemById);
router.put('/cart/update/:id', addToCartController.updateCartItem);
router.delete('/cart/delete/:id', addToCartController.deleteCartItem);
router.delete('/cart/delete-all/:id', addToCartController.deleteAllCartItems);

module.exports = router;