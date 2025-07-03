const express = require('express');
const router = express.Router();
const invoiceController = require('../controller/invoiceController');

router.post('/invoice/create', invoiceController.createInvoice);
router.get('/invoice/all', invoiceController.getAllInvoices);
router.get('/invoice/:id', invoiceController.getInvoiceById);
router.put('/invoice/update/:id', invoiceController.updateInvoice);
router.delete('/invoice/delete/:id', invoiceController.deleteInvoice);

module.exports = router;