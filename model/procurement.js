// models/procurement.js
const { Sequelize } = require('sequelize');
const db = require('../Config/db');
const { DataTypes } = Sequelize;
const Vendor = require('./vendor');
const DriversDetails =require('./driversDetails');

const Procurement = db.define('Procurement', {
  procurement_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    defaultValue: function () {
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      return `VLM-ORD${timestamp}${random}`;
    }
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['vendor', 'admin', 'farmer']]
    }
  },
  vendor_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'vendor',
      key: 'vendor_id'
    }
  },
  vendor_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
    driver_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'drivers_details',
      key: 'did'
    }
  },
  items: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  procurement_product_image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  order_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  expected_delivery_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  actual_delivery_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  notes: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['Requested', 'Confirmed', 'Approved', 'Waiting for Approval', 'Picked', 'Received', 'Rejected']]
    }
  },
  cgst: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0
  },
  sgst: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0
  },
  delivery_fee: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0
  }
}, {
  tableName: 'procurement',
  timestamps: true
});

Procurement.belongsTo(Vendor, { foreignKey: 'vendor_id' });
Procurement.belongsTo(DriversDetails, { foreignKey: 'driver_id', as: 'driver' });

module.exports = Procurement;
