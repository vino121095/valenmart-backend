const Procurement = require('../model/procurement');
const Vendor = require('../model/vendor');
const Products = require('../model/products');
const DriversDetails = require('../model/driversDetails');
const Notification = require('../model/notification');
const Orders = require('../model/orders');
const CustomerProfile = require('../model/customerProfile');

//Create Procurement
const createProcurement = async (req, res) => {
  try {
    const {
      order_date,
      actual_delivery_date,
      expected_delivery_date,
      type,
      vendor_name,
      vendor_id: bodyVendorId,
      items,
      category,
      unit,
      price,
      notes,
      status, // optional
      cgst,
      sgst,
      delivery_fee
    } = req.body;

    const procurementStatus = status || 'Requested';

    // ✅ Required field validation
    if (
      !order_date || !expected_delivery_date || !type || !items || !category || !unit ||
      !price || !notes
    ) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    if (type === 'admin' && !vendor_name) {
      return res.status(400).json({ message: 'vendor_name is required when type is admin' });
    }

    if (type === 'vendor' && !bodyVendorId) {
      return res.status(400).json({ message: 'vendor_id is required when type is vendor' });
    }

    // ✅ Parse numeric values
    const parsedUnit = parseFloat(unit);
    const parsedPrice = parseFloat(price);
    const parsedCgst = cgst ? parseFloat(cgst) : 0;
    const parsedSgst = sgst ? parseFloat(sgst) : 0;
    const parsedDeliveryFee = delivery_fee ? parseFloat(delivery_fee) : 0;

    // ✅ Total amount calculation
    const baseAmount = parsedUnit * parsedPrice;
    const cgstAmount = (baseAmount * parsedCgst) / 100;
    const sgstAmount = (baseAmount * parsedSgst) / 100;
    const total_amount = baseAmount + cgstAmount + sgstAmount + parsedDeliveryFee;

    // ✅ Image handling (via multer)
    let procurement_product_image = null;
    if (req.file && req.file.filename) {
      procurement_product_image = `/uploads/procurement_product_image/${req.file.filename}`;
    }

    // ✅ Get vendor_id
    let vendor_id = null;

    if (type === 'admin') {
      const vendor = await Vendor.findOne({ where: { contact_person: vendor_name } });
      if (!vendor) {
        return res.status(404).json({ message: `Vendor not found with name: ${vendor_name}` });
      }
      vendor_id = vendor.vendor_id;
    } else if (type === 'vendor') {
      vendor_id = bodyVendorId;
    }

    // ✅ Create procurement entry
    const newProcurement = await Procurement.create({
      order_date,
      actual_delivery_date,
      expected_delivery_date,
      type,
      vendor_name: type === 'admin' ? vendor_name : null,
      vendor_id,
      items,
      category,
      unit: parsedUnit,
      price: parsedPrice,
      total_amount,
      notes,
      status: procurementStatus,
      cgst: parsedCgst,
      sgst: parsedSgst,
      delivery_fee: parsedDeliveryFee,
      procurement_product_image
    });

    // ✅ Create notification for vendor
    if (vendor_id) {
      await Notification.create({
        procurement_id: newProcurement.procurement_id,
        vendor_id,
        message: `New procurement request #${newProcurement.procurement_id} created with status: ${procurementStatus} by admin`
      });
      // Create notification for admin with vendor name
      // Fetch vendor name (contact_person)
      const vendor = await Vendor.findByPk(vendor_id);
      const vendorName = vendor ? vendor.contact_person : 'Unknown Vendor';
      let adminMessage;
      if (type === 'admin') {
        adminMessage = `New procurement request #${newProcurement.procurement_id} created by admin for vendor: ${vendorName}`;
      } else {
        adminMessage = `New procurement request #${newProcurement.procurement_id} submitted by vendor: ${vendorName}`;
      }
      await Notification.create({
        procurement_id: newProcurement.procurement_id,
        admin_id: 1,
        message: adminMessage
      });
    }

    return res.status(201).json({
      message: 'Procurement order created successfully',
      data: newProcurement
    });

  } catch (error) {
    console.error('Error adding procurement:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

//Get All Procurement
const getAllProcurement = async (req, res) => {
  try {
    const procurement = await Procurement.findAll({
      include: [{
        model: Vendor,
        as: 'vendor',
        attributes: ['vendor_id', 'contact_person', 'address', 'phone', 'city', 'state', 'pincode'] // or any other fields you need
      },
      {
        model: DriversDetails,
        as: 'driver',
        attributes: ['did', 'first_name', 'last_name', 'phone', 'vehicle_number'] // or any other fields you need
      }
      ]
    });
    res.status(200).json({ data: procurement });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// //Get Procurement by ID
const getProcurementById = async (req, res) => {
  try {
    const { id } = req.params;
    const procurement = await Procurement.findByPk(id, {
      include: [{
        model: Vendor,
        as: 'vendor',
        attributes: ['vendor_id', 'contact_person'] // or any other fields you need
      },
      {
        model: DriversDetails,
        as: 'driver',
        attributes: ['did', 'first_name', 'last_name', 'phone', 'vehicle_number'] // or any other fields you need
      }
      ]
    });
    if (!procurement) {
      return res.status(404).json({ message: 'Procurement not found' });
    }
    res.status(200).json({ data: procurement });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

//Update Procurement
const updateProcurement = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      order_date,
      actual_delivery_date,
      expected_delivery_date,
      type,
      vendor_name,
      vendor_id: bodyVendorId,
      items,
      category,
      unit,
      price,
      driver_id,
      notes,
      status,
      cgst,
      sgst,
      delivery_fee,
      negotiationtype
    } = req.body;

    // Fetch existing record
    const procurement = await Procurement.findByPk(id);
    if (!procurement) {
      return res.status(404).json({ message: 'Procurement not found' });
    }

    // Recalculate total if necessary
    const parsedUnit = unit ? parseFloat(unit) : procurement.unit;
    const parsedPrice = price ? parseFloat(price) : procurement.price;
    const parsedCgst = cgst ? parseFloat(cgst) : procurement.cgst || 0;
    const parsedSgst = sgst ? parseFloat(sgst) : procurement.sgst || 0;
    const parsedDeliveryFee = delivery_fee ? parseFloat(delivery_fee) : procurement.delivery_fee || 0;

    const baseAmount = parsedUnit * parsedPrice;
    const cgstAmount = (baseAmount * parsedCgst) / 100;
    const sgstAmount = (baseAmount * parsedSgst) / 100;
    const total_amount = baseAmount + cgstAmount + sgstAmount + parsedDeliveryFee;

    // Handle optional image
    let procurement_product_image = procurement.procurement_product_image;
    if (req.file && req.file.filename) {
      procurement_product_image = `/uploads/procurement_product_image/${req.file.filename}`;
    }

    // Determine vendor_id
    let vendor_id = procurement.vendor_id;
    let finalVendorName = procurement.vendor_name;
    let originalStatus = procurement.status;
    let originalDriverId = procurement.driver_id;
   

    if (type === 'admin') {
      if (!vendor_name) {
        return res.status(400).json({ message: 'vendor_name is required when type is admin' });
      }
      const vendor = await Vendor.findOne({ where: { contact_person: vendor_name } });
      if (!vendor) {
        return res.status(404).json({ message: 'Vendor not found with name: ' + vendor_name });
      }
      vendor_id = vendor.vendor_id;
      finalVendorName = vendor_name;
    } else if (type === 'vendor') {
      if (!bodyVendorId) {
        return res.status(400).json({ message: 'vendor_id is required when type is vendor' });
      }
      vendor_id = bodyVendorId;
      finalVendorName = null;
    }

    // Store old values before update
    const oldPrice = procurement.price;
    let oldItems = procurement.items;
    try {
      oldItems = typeof oldItems === 'string' ? JSON.parse(oldItems) : oldItems;
    } catch (e) {
      oldItems = [];
    }

    let newItems = items;
    try {
      newItems = typeof newItems === 'string' ? JSON.parse(newItems) : newItems;
    } catch (e) {
      newItems = [];
    }

    // Detect price or per-product price change
    let priceChanged = false;
    if (typeof price !== 'undefined' && parseFloat(price) !== parseFloat(oldPrice)) {
      priceChanged = true;
    }

    let itemsChanged = false;
    if (items) {
      if (Array.isArray(oldItems) && Array.isArray(newItems) && oldItems.length === newItems.length) {
        for (let i = 0; i < oldItems.length; i++) {
          if (parseFloat(oldItems[i].unit_price) !== parseFloat(newItems[i].unit_price)) {
            itemsChanged = true;
            break;
          }
        }
      } else if (Array.isArray(oldItems) && Array.isArray(newItems)) {
        itemsChanged = true;
      }
    }

    // Send negotiation notification BEFORE update
    if (priceChanged || itemsChanged) {
      let message;
      if (negotiationtype === 'vendor') {
        message = `Vendor has updated the price for procurement #${procurement.procurement_id}. Please review and negotiate if needed.`;
        await Notification.create({
          procurement_id: procurement.procurement_id,
          admin_id: 1, // Assuming main admin
          message
        });
      }
      else if ((negotiationtype === 'admin') && vendor_id) {
        message = `Admin has updated the price for procurement #${procurement.procurement_id}. Please review and negotiate if needed.`;
        await Notification.create({
          procurement_id: procurement.procurement_id,
          vendor_id: vendor_id,
          message
        });
      } 
    }

    if (status === 'Approved') {
      // Get the driver_id from the request or procurement record
      const driverIdToUse = driver_id || procurement.driver_id;
      let driverName = 'Unknown Driver';
      if (driverIdToUse) {
        const driver = await DriversDetails.findByPk(driverIdToUse);
        if (driver) {
          driverName = `${driver.first_name || ''} ${driver.last_name || ''}`.trim();
        }
      }
      let message = `Driver (${driverName}) has accepted your Procurement #${procurement.procurement_id}.`;
      await Notification.create({
        procurement_id: procurement.procurement_id,
        admin_id: 1,
        message
      });
    }
    else if(status === 'Picked'){
      let message = `Driver has accepted your Procurement #${procurement.procurement_id}.`
      await Notification.create({
        procurement_id: procurement.procurement_id,
        admin_id:1,
        message
      })
    }

    // Now update the procurement
    await procurement.update({
      order_date: order_date || procurement.order_date,
      actual_delivery_date: actual_delivery_date || procurement.actual_delivery_date,
      expected_delivery_date: expected_delivery_date || procurement.expected_delivery_date,
      type: type || procurement.type,
      vendor_name: finalVendorName,
      vendor_id,
      items: items || procurement.items,
      category: category || procurement.category,
      unit: parsedUnit,
      price: parsedPrice,
      total_amount,
      driver_id: status === 'Requested' ? null : driver_id || procurement.driver_id,
      notes: notes || procurement.notes,
      status: status || procurement.status,
      cgst: parsedCgst,
      sgst: parsedSgst,
      delivery_fee: parsedDeliveryFee,
      procurement_product_image
    });

    // Status change notification
    if (procurement.status !== originalStatus) {
      await Notification.create({
        procurement_id: procurement.procurement_id,
        vendor_id: procurement.vendor_id,
        message: `Procurement #${procurement.procurement_id} status updated from ${originalStatus} to ${procurement.status}`
      });

      // if (procurement.driver_id) {
      //   await Notification.create({
      //     procurement_id: procurement.procurement_id,
      //     driver_id: procurement.driver_id,
      //     message: `Procurement #${procurement.procurement_id} status updated to ${procurement.status}`
      //   });
      // }
    }

    // Driver assignment notification
    if (req.body.driver_id && req.body.driver_id !== originalDriverId) {
      await Notification.create({
        procurement_id: procurement.procurement_id,
        driver_id: req.body.driver_id,
        message: `You have been assigned to handle Procurement #${procurement.procurement_id}`
      });
    }

    return res.status(200).json({
      message: 'Procurement order updated successfully',
      data: procurement
    });

  } catch (error) {
    console.error('Error updating procurement:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// //Delete Procurement
// const deleteProcurement = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const procurement = await Procurement.findByPk(id);
//         if (!procurement) {
//             return res.status(404).json({ message: 'Procurement not found' });
//         }
//         await procurement.destroy();
//         res.status(200).json({ message: 'Procurement deleted successfully' });
//     } catch (error) {
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// };

// // Get Procurement by procurement_from (optional filter method)
// const getProcurementBySource = async (req, res) => {
//     try {
//         const { procurement_from } = req.params;
//         const procurement = await Procurement.findAll({
//             where: { procurement_from }
//         });

//         if (procurement.length === 0) {
//             return res.status(404).json({ message: 'No procurement found for this source' });
//         }

//         res.status(200).json({ 
//             data: procurement,
//             count: procurement.length 
//         });
//     } catch (error) {
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// };

const getNotification = async (req, res) => {
  try {
    // Support both query params and route params
    const customer_id = req.query.customer_id || req.params.customer_id;
    const vendor_id = req.query.vendor_id || req.params.vendor_id;
    const driver_id = req.query.driver_id || req.params.driver_id;

    if (!customer_id && !vendor_id && !driver_id) {
      return res.status(400).json({ error: 'At least one ID (customer_id, vendor_id, or driver_id) is required' });
    }

    const whereClause = {};
    if (customer_id) whereClause.customer_id = customer_id;
    if (vendor_id) whereClause.vendor_id = vendor_id;
    if (driver_id) whereClause.driver_id = driver_id;

    const notifications = await Notification.findAll({
      where: whereClause,
      include: [
        {
          model: Orders,
          attributes: ['oid', 'status', 'order_date'],
          required: false
        },
        {
          model: Procurement,
          attributes: ['procurement_id', 'status', 'order_date'],
          required: false
        },
        {
          model: CustomerProfile,
          attributes: ['cpid', 'contact_person_name'],
          required: false
        },
        {
          model: Vendor,
          attributes: ['vendor_id', 'contact_person'],
          required: false
        },
        {
          model: DriversDetails,
          attributes: ['did', 'first_name', 'last_name'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const { notification_id } = req.params;
    const notification = await Notification.findByPk(notification_id);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await notification.update({ is_read: true });
    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createProcurement,
  getAllProcurement,
  getProcurementById,
  updateProcurement,
  // deleteProcurement,
  // getProcurementBySource
  getNotification,
  markNotificationAsRead
};
