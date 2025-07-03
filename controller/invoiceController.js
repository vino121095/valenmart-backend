const Invoice = require('../model/invoice');
const Orders = require('../model/orders');

// Create a new invoice
const createInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.create(req.body);
        res.status(201).json({ success: true, data: invoice });
    } catch (error) {
        console.error('Error creating invoice:', error);
        res.status(500).json({ success: false, message: 'Failed to create invoice', error: error.message });
    }
};

// Get all invoices
const getAllInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.findAll({
            include: [{ model: Orders }]
        });
        res.status(200).json({ success: true, data: invoices });
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch invoices', error: error.message });
    }
};

// Get invoice by ID
const getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id, {
            include: [{ model: Orders }]
        });

        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }

        res.status(200).json({ success: true, data: invoice });
    } catch (error) {
        console.error('Error fetching invoice:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch invoice', error: error.message });
    }
};

// Update invoice
const updateInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id);

        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }

        await invoice.update(req.body);
        res.status(200).json({ success: true, message: 'Invoice updated successfully', data: invoice });
    } catch (error) {
        console.error('Error updating invoice:', error);
        res.status(500).json({ success: false, message: 'Failed to update invoice', error: error.message });
    }
};

// Delete invoice
const deleteInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id);

        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }

        await invoice.destroy();
        res.status(200).json({ success: true, message: 'Invoice deleted successfully' });
    } catch (error) {
        console.error('Error deleting invoice:', error);
        res.status(500).json({ success: false, message: 'Failed to delete invoice', error: error.message });
    }
};

module.exports = {
    createInvoice,
    getAllInvoices,
    getInvoiceById,
    updateInvoice,
    deleteInvoice
};
