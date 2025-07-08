const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');
const DriversDetails = require('./driversDetails');
const Orders = require('./orders');
const Procurement = require('./procurement');

const Delivery = sequelize.define('Delivery', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  deliveryNo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Orders,
      key: 'oid'
    },
    onDelete: 'CASCADE'
  },
  procurement_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Procurement,
      key: 'procurement_id'
    },
    onDelete: 'CASCADE'
  },

  driver_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: DriversDetails,
      key: 'did'
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  timeSlot: {
    type: DataTypes.STRING,
    allowNull: false
  },
  delivery_image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Pending'
  },
  type: {
    type: DataTypes.ENUM('Customer', 'Vendor'),
    allowNull: false
  },
  charges: {
    type: DataTypes.FLOAT,  // or INTEGER if you only use whole numbers
    allowNull: false,
    defaultValue: 0
  },
  payment_status: {
    type: DataTypes.ENUM('Receive', 'Received'),
    allowNull: false,
    defaultValue: 'Receive'
  }

}, {
  tableName: 'delivery',
  timestamps: true
});

// Define the relationship (optional but useful for eager loading)
Delivery.belongsTo(DriversDetails, {
  foreignKey: 'driver_id',
  as: 'driver'
});


module.exports = Delivery;
