const Cart = require('../model/addToCart');
const Products = require('../model/products');
const CustomerProfile = require('../model/customerProfile');

// Create a cart item
exports.createCartItem = async (req, res) => {
  try {
    const { customer_id, product_id, quantity } = req.body;

    // Validate required fields
    if (!customer_id || !product_id || !quantity) {
      return res.status(400).json({ message: 'customer_id, product_id, and quantity are required' });
    }

    // Check if customer profile exists
    const customer = await CustomerProfile.findOne({where: {user_id: customer_id}});
    if (!customer) {
      return res.status(404).json({ message: 'Customer profile not found' });
    }

    // Find the product
    const product = await Products.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if item already exists in cart
    const existingCartItem = await Cart.findOne({
      where: {
        customer_id: customer.user_id,
        product_id
      }
    });

    if (existingCartItem) {
      // Update existing cart item
      existingCartItem.quantity = quantity;
      existingCartItem.price_at_time = product.price;
      await existingCartItem.save();
      return res.json(existingCartItem);
    }

    // Create new cart item if it doesn't exist
    const price_at_time = product.price ;
    const cartItem = await Cart.create({
      customer_id: customer.user_id,
      product_id,
      quantity,
      product_name: product.product_name,
      price_at_time
    });

    res.status(201).json(cartItem);
  } catch (error) {
    console.error('Error creating cart item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all cart items
exports.getAllCartItems = async (req, res) => {
  try {
    const cartItems = await Cart.findAll({
      include: [Products, CustomerProfile]
    });
    res.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all cart items for a specific customer
exports.getCartItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const cartItems = await Cart.findAll({
      where: { customer_id : id },
      include: [Products, CustomerProfile]
    });

    if (!cartItems || cartItems.length === 0) {
      return res.status(404).json({ message: 'No cart items found for this customer' });
    }

    res.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update cart item
exports.updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const cartItem = await Cart.findByPk(id);
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    // If quantity is provided, update it and recalculate price
    if (quantity) {
      cartItem.quantity = quantity;

      const product = await Products.findByPk(cartItem.product_id);
      if (product) {
        cartItem.price_at_time = product.price * quantity;
      }
    }

    await cartItem.save();
    res.json(cartItem);
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete cart item
exports.deleteCartItem = async (req, res) => {
  try {
    const { id } = req.params;

    const cartItem = await Cart.findByPk(id);
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    await cartItem.destroy();
    res.json({ message: 'Cart item deleted successfully' });
  } catch (error) {
    console.error('Error deleting cart item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete all cart items for a specific customer
exports.deleteAllCartItems = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if customer exists
    const customer = await CustomerProfile.findOne({where: {cpid: id}});
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Delete all cart items for the customer
    const deletedCount = await Cart.destroy({
      where: { customer_id: id }
    });

    if (deletedCount === 0) {
      return res.status(404).json({ message: 'No cart items found for this customer' });
    }

    res.status(200).json({
      message: `Successfully deleted ${deletedCount} cart items`,
      deletedCount
    });
  } catch (error) {
    console.error('Error deleting cart items:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// module.exports = {
//   createCartItem,
//   getAllCartItems,
//   getCartItemById,
//   updateCartItem,
//   deleteCartItem,
//   deleteAllCartItems
// };
