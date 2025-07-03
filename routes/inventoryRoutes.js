const express = require('express');
const router = express.Router();
const inventoryController = require('../controller/inventoryController');

router.post('/inventory/create', inventoryController.createInventory);
router.get('/inventory/all', inventoryController.getAllInventory);
router.get('/inventory/:id', inventoryController.getInventoryById);
router.put('/inventory/update/:id', inventoryController.updateInventory);
router.delete('/inventory/delete/:id', inventoryController.deleteInventory);

module.exports = router;