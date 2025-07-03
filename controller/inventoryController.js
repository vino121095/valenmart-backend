const Inventory = require('../model/inventory');
const Products = require('../model/products');

const createInventory = async (req, res) => {
    try {
        const { product_id, quantity_in_stock, unit_price, reorder_level, last_restocked } = req.body;
        const newInventory = await Inventory.create({
            product_id,
            quantity_in_stock,
            unit_price,
            reorder_level,
            last_restocked
        });
        res.status(201).json(newInventory);
    } catch (error) {
        console.error('Error creating inventory:', error);
        res.status(500).json({ error: 'Failed to create inventory record' });
    }
};

const getAllInventory = async (req, res) => {
    try {
        const inventories = await Inventory.findAll({
            include: [
                {
                    model: Products,
                    attributes: ['pid', 'product_name', 'discription', 'category', 'unit', 'product_image', 'is_seasonal', 'season_start', 'season_end', 'is_active', 'price'],
                }
            ]
        });
        res.json(inventories);
    } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ error: 'Failed to fetch inventory records' });
    }
};

const getInventoryById = async (req, res) => {
    try {
        const id = req.params.id;
        const inventory = await Inventory.findByPk(id, {
            include: [
                {
                    model: Products,
                    attributes: ['pid', 'product_name', 'discription', 'category', 'unit', 'product_image', 'is_seasonal', 'season_start', 'season_end', 'is_active', 'price'],
                }
            ]
        });
        if (!inventory) {
            return res.status(404).json({ error: 'Inventory record not found' });
        }
        res.json(inventory);
    } catch (error) {
        console.error('Error fetching inventory by id:', error);
        res.status(500).json({ error: 'Failed to fetch inventory record' });
    }
};

const updateInventory = async (req, res) => {
    try {
        const id = req.params.id;
        const { product_id, quantity_in_stock, unit_price, reorder_level, last_restocked } = req.body;
        const inventory = await Inventory.findByPk(id);
        if (!inventory) {
            return res.status(404).json({ error: 'Inventory record not found' });
        }

        inventory.product_id = product_id !== undefined ? product_id : inventory.product_id;
        inventory.quantity_in_stock = quantity_in_stock !== undefined ? quantity_in_stock : inventory.quantity_in_stock;
        inventory.unit_price = unit_price !== undefined ? unit_price : inventory.unit_price;
        inventory.reorder_level = reorder_level !== undefined ? reorder_level : inventory.reorder_level;
        inventory.last_restocked = last_restocked !== undefined ? last_restocked : inventory.last_restocked;

        await inventory.save();
        res.json(inventory);
    } catch (error) {
        console.error('Error updating inventory:', error);
        res.status(500).json({ error: 'Failed to update inventory record' });
    }
};

const deleteInventory = async (req, res) => {
    try {
        const id = req.params.id;
        const inventory = await Inventory.findByPk(id);
        if (!inventory) {
            return res.status(404).json({ error: 'Inventory record not found' });
        }
        await inventory.destroy();
        res.json({ message: 'Inventory record deleted successfully' });
    } catch (error) {
        console.error('Error deleting inventory:', error);
        res.status(500).json({ error: 'Failed to delete inventory record' });
    }
};

module.exports = {
    createInventory,
    getAllInventory,
    getInventoryById,
    updateInventory,
    deleteInventory
};

