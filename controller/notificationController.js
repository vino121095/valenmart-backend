const { Orders, CustomerProfile, Procurement } = require('../model/index.js');
const Notification = require('../model/notification.js');
const sequelize = require('../Config/db.js');


const getNotification = async (req, res) => {
    try {
      const { id } = req.params;
  
      if (!id) {
        return res.status(400).json({ error: 'customer_id is required' });
      }
  
      const notifications = await Notification.findAll({
        where: { customer_id:id },
        include: [
          {
            model: Orders,
            attributes: ['oid', 'status', 'order_date']
          },
          {
            model: CustomerProfile,
            attributes: ['cpid', 'contact_person_name', 'contact_person_email']
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

  
const getVendorNotification = async (req, res) => {
    try {
      const { id } = req.params;
  
      if (!id) {
        return res.status(400).json({ error: 'Vendor is required' });
      }
  
      const notifications = await Notification.findAll({
        where: { vendor_id :id },
        include: [
          {
            model: Procurement,
            attributes: ['procurement_id', 'status', 'order_date']
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

  
const getDriverNotification = async (req, res) => {
    try {
      const { id } = req.params;
  
      if (!id) {
        return res.status(400).json({ error: 'Vendor is required' });
      }
  
      const notifications = await Notification.findAll({
        where: { driver_id :id },
        include: [
          {
            model: Procurement,
            attributes: ['procurement_id', 'status', 'order_date']
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

  const markAsRead = async(req,res)=>{
    try {
        const { id } = req.params;
    
        if (!id) {
          return res.status(400).json({ error: 'customer_id is required' });
        }
    
        await Notification.update(
          { is_read: true },
          { where: { customer_id: id } }
        );
    
        return res.status(200).json({message:'All notifications marked as read successfully'});
      } catch (error) {
        console.error('Error updating notifications:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
  }

  const vendorMarkAsRead = async(req,res)=>{
    try {
        const { id } = req.params;
    
        if (!id) {
          return res.status(400).json({ error: 'vendor_id is required' });
        }
    
        await Notification.update(
          { is_read: true },
          { where: { vendor_id: id } }
        );
    
        return res.status(200).json({message:'All notifications marked as read successfully'});
      } catch (error) {
        console.error('Error updating notifications:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
  }

  const driverMarkAsRead = async(req,res)=>{
    try {
        const { id } = req.params;
    
        if (!id) {
          return res.status(400).json({ error: 'vendor_id is required' });
        }
    
        await Notification.update(
          { is_read: true },
          { where: { driver_id: id } }
        );
    
        return res.status(200).json({message:'All notifications marked as read successfully'});
      } catch (error) {
        console.error('Error updating notifications:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
  }


  module.exports = {
    getNotification,
    markAsRead,
    getVendorNotification,
    vendorMarkAsRead,
    getDriverNotification,
    driverMarkAsRead
  };