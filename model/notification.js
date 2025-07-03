const { Sequelize } = require('sequelize');
const db = require('../Config/db');
const { DataTypes } = Sequelize;

// Import related models
const Orders = require('./orders');
const CustomerProfile = require('./customerProfile');
const Procurement = require('./procurement');
const Vendor = require('./vendor');
const DriversDetails = require('./driversDetails');

// Define the Notification model
const Notification = db.define('Notification', {
  nid: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // For customer-side notifications
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Orders,
      key: 'oid'
    },
    onDelete: 'CASCADE'
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: CustomerProfile,
      key: 'cpid'
    },
    onDelete: 'CASCADE'
  },

  // For vendor-side notifications
  procurement_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Procurement,
      key: 'procurement_id'
    },
    onDelete: 'CASCADE'
  },
  vendor_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Vendor,
      key: 'vendor_id'
    },
    onDelete: 'CASCADE'
  },

  // Shared driver reference
  driver_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: DriversDetails,
      key: 'did'
    },
    onDelete: 'CASCADE'
  },

  // Message content
  message: {
    type: DataTypes.STRING,
    allowNull: false
  },

  // Read flag
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'notifications',
  timestamps: true
});

// Set up associations
Notification.belongsTo(Orders, { foreignKey: 'order_id' });
Orders.hasMany(Notification, { foreignKey: 'order_id' });

Notification.belongsTo(CustomerProfile, { foreignKey: 'customer_id' });
CustomerProfile.hasMany(Notification, { foreignKey: 'customer_id' });

Notification.belongsTo(Procurement, { foreignKey: 'procurement_id' });
Procurement.hasMany(Notification, { foreignKey: 'procurement_id' });

Notification.belongsTo(Vendor, { foreignKey: 'vendor_id' });
Vendor.hasMany(Notification, { foreignKey: 'vendor_id' });

Notification.belongsTo(DriversDetails, { foreignKey: 'driver_id' });
DriversDetails.hasMany(Notification, { foreignKey: 'driver_id' });

module.exports = Notification;
