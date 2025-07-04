// const Delivery = require('../model/delivery');
const { where } = require('sequelize');
const { DriversDetails, Delivery, Orders, Procurement } = require('../model/index');
const Notification = require('../model/notification.js');
// Helper to generate unique delivery number
async function generateUniqueDeliveryNumber(driver_id) {
  let count = await Delivery.count({ where: { driver_id } });
  let deliveryNo;
  let exists = true;

  while (exists) {
    count += 1;
    deliveryNo = `Delivery #${String(count).padStart(2, '0')}`;
    const existing = await Delivery.findOne({ where: { deliveryNo } });
    if (!existing) exists = false;
  }

  return deliveryNo;
}

// Helper to format delivery response based on status
function formatDelivery(delivery) {
  const formatted = {
    id: delivery.id,
    driver: delivery.driver ? {
      did: delivery.driver.did,
      first_name: delivery.driver.first_name,
      last_name: delivery.driver.last_name,
      phone: delivery.driver.phone,
      vehicle_number: delivery.driver.vehicle_number
    } : null,
    date: delivery.date,
    timeSlot: delivery.timeSlot,
    delivery_image: delivery.delivery_image
      ? `uploads\\delivery_image\\${delivery.delivery_image}`
      : null,
    status: delivery.status,
    type: delivery.type,
    charges: delivery.status === 'Completed' || delivery.status === 'Delivered' ? delivery.charges : null,
  };

  // Add deliveryNo only if status is Completed
  if (delivery.status === 'Completed') {
    formatted.deliveryNo = delivery.deliveryNo || `DLV-${delivery.id.toString().padStart(4, '0')}`;
  }

  return formatted;
}


// Create new delivery
exports.createDelivery = async (req, res) => {
  try {
    const { driver_id, date, timeSlot, status, type, charges, order_id, procurement_id } = req.body;

    const deliveryNo = await generateUniqueDeliveryNumber(driver_id);

    const newDelivery = await Delivery.create({
      deliveryNo,
      driver_id,
      order_id,
      date,
      timeSlot,
      status,
      type,
      procurement_id,
      charges: parseFloat(charges)
    });

    res.status(201).json({ message: 'Delivery created', delivery: formatDelivery(newDelivery) });
  } catch (error) {
    res.status(500).json({ message: 'Error creating delivery', error });
  }
};

// Update delivery by deliveryNo
// Update delivery by ID instead of deliveryNo
exports.updateDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const { driver_id, date, timeSlot, status, type } = req.body;
    const delivery_image = req.file; // multer handles this

    const delivery = await Delivery.findByPk(id);

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    // Validation: can't mark Delivered without an image
    if (status === 'Delivered' && !delivery_image && !delivery.delivery_image) {
      return res.status(400).json({ message: 'Cannot mark as Delivered without delivery image' });
    }

    // Prepare fields to update
    const updateFields = {
      delivery_image,
      driver_id,
      date,
      timeSlot,
      status,
      type
    };

    // If image is uploaded, update delivery_image and force status to Delivered
    if (delivery_image) {
      updateFields.delivery_image = delivery_image.filename;
      updateFields.status = 'Delivered';
    }

    // Perform the update
    await delivery.update(updateFields);

    // Send notification to admin if delivered
    if (updateFields.status === 'Delivered') {
      // Find the related order (assuming delivery has order_id)
      let order = null;
      if (delivery.order_id) {
        order = await Orders.findByPk(delivery.order_id);
      }
      let driverName = '';
      if (delivery.driver_id) {
        const driver = await DriversDetails.findByPk(delivery.driver_id);
        if (driver) {
          driverName = `${driver.first_name} ${driver.last_name}`;
        }
      }
      await Notification.create({
        order_id: order ? order.oid : delivery.order_id,
        admin_id: 1,
        message: `Order #${order ? order.oid : delivery.order_id} has been marked as Completed by driver ${driverName}. Status: Completed.`
      });
    }

    res.status(200).json({ message: 'Delivery updated', delivery: formatDelivery(delivery) });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Error updating delivery', error });
  }
};

// Get delivery by ID
exports.getDeliveryById = async (req, res) => {
  try {
    const { id } = req.params;
    const delivery = await Delivery.findByPk(id, {
      include: [
        {
          model: DriversDetails,
          as: 'driver',
          attributes: ['did', 'first_name', 'last_name', 'phone', 'vehicle_number'],
        },
      ],
    });

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    res.status(200).json(formatDelivery(delivery));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching delivery', error });
  }
};

exports.getDeliveryByOrderId = async (req, res) => {
  try {
    const { id } = req.params;

    let delivery = await Delivery.findOne({ where: { order_id: id } });
    if (!delivery) {
      delivery = await Delivery.findOne({ where: { procurement_id: id } });
    }

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    res.status(200).json({data:delivery});
  } catch (error) {
    res.status(500).json({ message: 'Error fetching delivery', error });
  }
};

// Delete delivery by ID
exports.deleteDelivery = async (req, res) => {
  try {
    const { id } = req.params;

    const delivery = await Delivery.findByPk(id);
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    await delivery.destroy();
    res.status(200).json({ message: 'Delivery deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting delivery', error });
  }
};

// Mark delivery as Completed by deliveryNo
exports.markAsCompleted = async (req, res) => {
  try {
    const { id } = req.params;
    const delivery_image = req.file ? req.file.filename : null;

    if (!delivery_image) {
      return res.status(400).json({ message: 'Image must be provided' });
    }

    let delivery = await Delivery.findOne({ where: { order_id: id } });
    if (!delivery) {
      delivery = await Delivery.findOne({ where: { procurement_id: id } });
    }

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    await delivery.update({ status: 'Completed', delivery_image });

    return res.status(200).json({ message: 'Delivery marked as completed', delivery: formatDelivery(delivery) });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating status', error });
  }
};

// Get all deliveries
exports.getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.findAll({
      include: [
        {
          model: DriversDetails,
          as: 'driver',
          attributes: ['did', 'first_name', 'last_name', 'phone', 'vehicle_number'],
        },
      ],
    });
    // console.log("RAW DELIVERIES:", deliveries); 
    const formatted = deliveries.map(formatDelivery);
    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching deliveries', error });
  }
};

// Get a specific delivery by deliveryNo
exports.getDelivery = async (req, res) => {
  try {
    const { deliveryNo } = req.params;
    const delivery = await Delivery.findOne({ where: { deliveryNo } });

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    res.status(200).json(formatDelivery(delivery));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching delivery', error });
  }
};

// Mark delivery as Delivered with image upload
exports.markAsDeliveredWithImage = async (req, res) => {
  try {
    const { id } = req.params;
    const {status} = req.body;
    const delivery_image = req.file ? req.file.filename : null;
    let delivery;
    if (!delivery_image) {
      return res.status(400).json({ message: 'Image must be provided' });
    }

    if(status === 'Delivered'){
      delivery = await Delivery.findOne({ where: { order_id: id } });
    }
    else{
      delivery = await Delivery.findOne({ where: { procurement_id: id } });
    }

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    // Update related Orders or Procurement with correct where clause
    if (delivery.order_id) {
      await Orders.update(
        { status: 'Completed' },
        { where: { oid: delivery.order_id } }
      );
    } else if (delivery.procurement_id) {
      await Procurement.update(
        { status: 'Picked' },
        { where: { procurement_id: delivery.procurement_id } }
      );
    }

    const driver = await DriversDetails.findByPk(delivery.driver_id);
    const driverName = `${driver.first_name} ${driver.last_name}`;

    await delivery.update({
      status: 'Delivered',
      delivery_image
    });
    
    if(delivery.order_id){
      await Notification.create({
        order_id: delivery.order_id,
        admin_id: 1,
        message: `Order #${delivery.order_id} has been marked as Completed by driver ${driverName}. Status: Completed.`
      });
    }
    else if(delivery.procurement_id){
      await Notification.create({
        order_id: null,
        admin_id: 1,
        message: `Procurement #${delivery.procurement_id} has been marked as Completed by driver ${driverName}. Status: Completed.`
      });
    }


    return res.status(200).json({ message: 'Delivery marked as Delivered', delivery: formatDelivery(delivery) });
  } catch (error) {
    console.error('Mark as Delivered error:', error);
    return res.status(500).json({ message: 'Error marking as Delivered', error });
  }
};