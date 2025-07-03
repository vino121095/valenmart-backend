const express = require('express');
const router = express.Router();
const productsController = require('../controller/productsController');
const { uploadProductImage } = require('../middleware/multer');

router.post('/product/create', uploadProductImage, productsController.createProduct);
router.get('/product/all', productsController.getAllProducts);
router.get('/product/:id', productsController.getProductsById);
router.put('/product/update/:id', uploadProductImage, productsController.updateProducts);
router.delete('/product/delete/:id', productsController.deleteProducts);

module.exports = router;