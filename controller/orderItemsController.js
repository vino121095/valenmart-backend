const OrderItems = require('../model/orderItems');
const Products = require('../model/products');
const Orders = require('../model/orders');

//Create Order Items
const createOrderItem = async (req, res) => {
  try {
    const { order_id, product_id, quantity, notes } = req.body;

    // Fetch product to get unit price
    const product = await Products.findByPk(product_id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const unit_price = product.price;  // get price from product
    const line_total = quantity * unit_price;

    const newItem = await OrderItems.create({
      order_id,
      product_id,
      quantity,
      unit_price,
      line_total,
      notes
    });

    res.status(201).json({
      message: 'Order item created successfully',
      data: newItem
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get All Order Items
const getAllOrderItems = async (req, res) => {
    try {
        const orderItems = await OrderItems.findAll({
      include: [
        {
        model: Products,
        attributes: ['product_name', 'cgst', 'sgst', 'delivery_fee'], // Only include product_name
      },
       {
        model: Orders,
        attributes: ['order_id'], // Only include product_name
      }
    ]
    });
        res.status(200).json({ data: orderItems });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Get Order Item by ID
const getOrderItemById = async (req, res) => {
    try {
        const { id } = req.params;
        const orderItem = await OrderItems.findByPk(id, {
               include: [
        {
        model: Products,
        attributes: ['product_name', 'cgst', 'sgst', 'delivery_fee'], // Only include product_name
      },
       {
        model: Orders,
        attributes: ['order_id'], // Only include product_name
      }
    ]
        });
        if (!orderItem) {
            return res.status(404).json({ message: 'Order item not found' });
        }
        res.status(200).json({ data: orderItem });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Update Order Item
const updateOrderItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { order_id, product_id, quantity, notes } = req.body;

    const orderItem = await OrderItems.findByPk(id);
    if (!orderItem) {
      return res.status(404).json({ message: 'Order item not found' });
    }

    // Fetch product to get the price
    const product = await Products.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const unit_price = product.price;
    const line_total = quantity * unit_price;

    const updatedItem = await orderItem.update({
      order_id,
      product_id,
      quantity,
      unit_price,
      line_total,
      notes
    });

    res.status(200).json({
      message: 'Order item updated successfully',
      data: updatedItem
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Order Item
const deleteOrderItem = async (req, res) => {
    try {
        const { id } = req.params;
        const orderItem = await OrderItems.findByPk(id);
        if (!orderItem) {
            return res.status(404).json({ message: 'Order item not found' });
        }
        await orderItem.destroy();
        res.status(200).json({ message: 'Order item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    createOrderItem,
    getAllOrderItems,
    getOrderItemById,
    updateOrderItem,
    deleteOrderItem
};
