// const Orders = require('../model/orders');
const { Orders, CustomerProfile, DriversDetails, OrderItems, Products } = require('../model/index.js');
const Notification = require('../model/notification.js');
const sequelize = require('../Config/db.js');
const Delivery = require('../model/delivery.js');

// Create Order
const createOrder = async (req, res) => {
  try {
    const {
      cpid,
      product_id,
      order_date,
      status,
      delivery_date,
      actual_delivery_date,
      delivery_time,
      special_instructions,
      total_amount,
      payment_method,
      invoice_generated,
      address,
      city,
      state,
      postal_code,
      delivery_contact_name,
      delivery_contact_phone,
      order_items // Array of order items
    } = req.body;

    // Start a transaction
    const result = await sequelize.transaction(async (t) => {
      // Create the order
      const newOrder = await Orders.create({
        customer_id: cpid,
        // product_id: product_id,
        order_date,
        status,
        delivery_date,
        actual_delivery_date,
        delivery_time,
        special_instructions,
        total_amount,
        payment_method,
        invoice_generated,
        address,
        city,
        state,
        postal_code,
        delivery_contact_name,
        delivery_contact_phone
      }, { transaction: t });

      // Create order items if provided
      if (order_items && Array.isArray(order_items)) {
        const orderItemsPromises = order_items.map(async (item) => {
          const { product_id, quantity, notes } = item;

          // Fetch product to get unit price
          const product = await Products.findByPk(product_id, { transaction: t });
          if (!product) {
            throw new Error(`Product with ID ${product_id} not found`);
          }

          const unit_price = product.price;
          const line_total = quantity * unit_price;

          return OrderItems.create({
            order_id: newOrder.oid,
            product_id,
            quantity,
            unit_price,
            line_total,
            notes
          }, { transaction: t });
        });

        await Promise.all(orderItemsPromises);
      }

      // Create notification
      await Notification.create({
        order_id: newOrder.oid,
        customer_id: newOrder.customer_id,
        message: `New order created with status: ${status}`
      }, { transaction: t });

      return newOrder;
    });

    // Fetch the complete order with its items
    const completeOrder = await Orders.findByPk(result.oid, {
      include: [
        { model: OrderItems, include: [{ model: Products }] }
      ]
    });

    res.status(201).json({
      message: 'Order created successfully',
      data: {
        ...completeOrder.toJSON(),
        order_id: completeOrder.order_id // Explicitly include order_id in response
      }
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get All Orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Orders.findAll({
      include: [
        {
          model: DriversDetails,
          attributes: ['did', 'first_name', 'last_name', 'phone', 'vehicle_number'],
          // as: 'Driver'
        },
        {
          model: CustomerProfile,
          attributes: ['cpid', 'contact_person_name', 'contact_person_email', 'institution_name', 'address', 'contact_person_phone']
        }
      ]
    });
    res.status(200).json({ data: orders });
  } catch (error) {
    console.error('Get All Orders Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


// Get Order by ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Orders.findByPk(id, {
      include: [
        { model: DriversDetails, attributes: ['did', 'first_name', 'last_name', 'phone', 'vehicle_number'] },
        { model: CustomerProfile, attributes: ['cpid', 'contact_person_name', 'contact_person_email', 'institution_name', 'address', 'contact_person_phone'] },
      ]
    });

    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.status(200).json({ data: order });
  } catch (error) {
    console.error('Get Order by ID Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update Order
// const updateOrder = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const order = await Orders.findByPk(id);

//     if (!order) return res.status(404).json({ message: 'Order not found' });

//     const originalStatus = order.status;
//     const originalDriverId = order.driver_id;

//     // Log the body
//     console.log('Update Order Body:', req.body);

//     // Update using bulk update
//     await order.update({
//       customer_id: req.body.cpid ?? order.customer_id,
//       driver_id: req.body.driver_id ?? order.driver_id,
//       product_id: req.body.product_id ?? order.product_id,
//       order_date: req.body.order_date ?? order.order_date,
//       status: req.body.status ?? order.status,
//       delivery_date: req.body.delivery_date ?? order.delivery_date,
//       actual_delivery_date: req.body.actual_delivery_date ?? order.actual_delivery_date,
//       delivery_time: req.body.delivery_time ?? order.delivery_time,
//       special_instructions: req.body.special_instructions ?? order.special_instructions,
//       total_amount: req.body.total_amount ?? order.total_amount,
//       payment_method: req.body.payment_method ?? order.payment_method,
//       invoice_generated: req.body.invoice_generated ?? order.invoice_generated,
//       address: req.body.address ?? order.address,
//       city: req.body.city ?? order.city,
//       state: req.body.state ?? order.state,
//       postal_code: req.body.postal_code ?? order.postal_code,
//       delivery_contact_name: req.body.delivery_contact_name ?? order.delivery_contact_name,
//       delivery_contact_phone: req.body.delivery_contact_phone ?? order.delivery_contact_phone
//     });

//     // Notify on status change
//     if (order.status !== originalStatus) {
//       await Notification.create({
//         order_id: order.oid,
//         customer_id: order.customer_id,
//         message: `Order #${order.oid} status updated from ${originalStatus} to ${order.status}`
//       });

//       if (order.driver_id) {
//         await Notification.create({
//           order_id: order.oid,
//           driver_id: order.driver_id,
//           message: `Order #${order.oid} status updated to ${order.status}`
//         });
//       }
//     }

//     // Driver assignment notification
//     if (req.body.driver_id && req.body.driver_id !== originalDriverId) {
//       await Notification.create({
//         order_id: order.oid,
//         driver_id: req.body.driver_id,
//         message: `You have been assigned to deliver Order #${order.oid}`
//       });
//     }

//     // Auto-complete logic if Delivered
//     if (order.status === 'Delivered' && order.driver_id) {
//       const { Op } = require('sequelize');

//       const deliveries = await Delivery.findAll({
//         where: {
//           driver_id: order.driver_id,
//           status: { [Op.ne]: 'Completed' }
//         }
//       });

//       for (const d of deliveries) {
//         await d.update({ status: 'Completed' });
//       }

//       const driver = await DriversDetails.findByPk(order.driver_id);
//       if (driver && driver.status !== 'Available') {
//         driver.status = 'Available';
//         await driver.save();
//       }
//     }

//     res.status(200).json({
//       message: 'Order updated successfully',
//       data: order
//     });

//   } catch (error) {
//     console.error('Update Order Error:', error);
//     res.status(500).json({ message: error.message || 'Internal Server Error' });
//   }
// };

const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Orders.findByPk(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const originalStatus = order.status;
    const originalDriverId = order.driver_id;
    // Log the body
    console.log('Update Order Body:', req.body);
    // Update order fields
    await order.update({
      customer_id: req.body.customer_id ?? order.customer_id,
      driver_id: req.body.driver_id ?? order.driver_id,
      order_date: req.body.order_date ?? order.order_date,
      status: req.body.status ?? order.status,
      delivery_date: req.body.delivery_date ?? order.delivery_date,
      actual_delivery_date: req.body.actual_delivery_date ?? order.actual_delivery_date,
      delivery_time: req.body.delivery_time ?? order.delivery_time,
      special_instructions: req.body.special_instructions ?? order.special_instructions,
      total_amount: req.body.total_amount ?? order.total_amount,
      payment_method: req.body.payment_method ?? order.payment_method,
      invoice_generated: req.body.invoice_generated ?? order.invoice_generated,
      address: req.body.address ?? order.address,
      city: req.body.city ?? order.city,
      state: req.body.state ?? order.state,
      postal_code: req.body.postal_code ?? order.postal_code,
      delivery_contact_name: req.body.delivery_contact_name ?? order.delivery_contact_name,
      delivery_contact_phone: req.body.delivery_contact_phone ?? order.delivery_contact_phone
    });
    // Create notifications if status changed
    if (order.status !== originalStatus) {
      await Notification.create({
        order_id: order.oid,
        customer_id: order.customer_id,
        message: `Order #${order.oid} status updated from ${originalStatus} to ${order.status}`
      });
      if (order.driver_id) {
        await Notification.create({
          order_id: order.oid,
          driver_id: order.driver_id,
          message: `Order #${order.oid} status updated to ${order.status}`
        });
      }
    }
    // Driver assignment notification
    if (req.body.driver_id && req.body.driver_id !== originalDriverId) {
      await Notification.create({
        order_id: order.oid,
        driver_id: req.body.driver_id,
        message: `You have been assigned to deliver Order #${order.oid}`
      });
    }
    // :white_tick: Reduce product stock if order is delivered
    if (order.status === 'Delivered') {
      const orderItems = await OrderItems.findAll({
        where: { order_id: order.oid }
      });
      for (const item of orderItems) {
        const product = await Products.findByPk(item.product_id);
        if (product) {
          const newUnit = product.unit - item.quantity;
          if (newUnit < 0) {
            return res.status(400).json({
              message: `Not enough stock for product ${product.product_name}`
            });
          }
          product.unit = newUnit;
          await product.save();
        }
      }
    }
    // :white_tick: Mark related deliveries completed
    if (order.status === 'Delivered' && order.driver_id) {
      const { Op } = require('sequelize');
      const deliveries = await Delivery.findAll({
        where: {
          driver_id: order.driver_id,
          status: { [Op.ne]: 'Completed' }
        }
      });
      for (const d of deliveries) {
        await d.update({ status: 'Completed' });
      }
      const driver = await DriversDetails.findByPk(order.driver_id);
      if (driver && driver.status !== 'Completed') {
        driver.status = 'Completed';
        await driver.save();
      }
    }
    res.status(200).json({
      message: 'Order updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Update Order Error:', error);
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};


// Delete Order
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Orders.findByPk(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    await order.destroy();

    await Notification.create({
      order_id: order.oid,
      customer_id: order.customer_id,
      message: `Order #${id} has been deleted`
    });

    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete Order Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

//Get Notification



// Get Orders by Customer ID
const getOrdersByCustomerId = async (req, res) => {
  try {
    const { customer_id } = req.params;

    // Check if customer exists
    const customer = await CustomerProfile.findByPk(customer_id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const orders = await Orders.findAll({
      where: { customer_id },
      include: [
        {
          model: DriversDetails,
          attributes: ['did', 'first_name', 'last_name']
        },
        {
          model: CustomerProfile,
          attributes: ['cpid', 'contact_person_name', 'contact_person_email', 'institution_name']
        },
        {
          model: OrderItems,
          include: [{ model: Products }]
        }
      ],
      order: [['createdAt', 'DESC']] // Most recent orders first
    });

    if (!orders || orders.length === 0) {
      return res.status(200).json({
        message: 'No orders found for this customer',
        data: []
      });
    }

    res.status(200).json({
      message: 'Orders retrieved successfully',
      data: orders
    });
  } catch (error) {
    console.error('Get Orders by Customer ID Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getOrdersByCustomerId
};
