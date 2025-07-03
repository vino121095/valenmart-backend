const express = require('express');
const router = express.Router();
const categoryController = require('../controller/categoryController');
const { uploadCategoryImage } = require('../middleware/multer')

router.post('/category/create', uploadCategoryImage, categoryController.createCategory);
router.get('/category/all', categoryController.getCategory);
router.get('/category/:id', categoryController.getCategoryById);
router.put('/category/update/:id', uploadCategoryImage, categoryController.updateCategory);
router.delete('/category/delete/:id', categoryController.deleteCategory);

module.exports = router;