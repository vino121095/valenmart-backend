const { Sequelize } = require('sequelize');
const db = require('../Config/db');
const { DataTypes } = Sequelize;
const CustomerProfile = require('./customerProfile');
const DriversDetails = require('./driversDetails');
const Products = require('./products');

const Orders = db.define('Orders', {
  oid: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    defaultValue: function() {
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      return `VLM-ORD${timestamp}${random}`;
    }
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: CustomerProfile,
      key: 'cpid'
    },
    onDelete: 'CASCADE'
  },
  driver_id: { // ✅ Add driver_id as FK
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: DriversDetails,
      key: 'did'
    },
    onDelete: 'CASCADE'
  },
  order_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['New Order', 'Confirmed', 'Waiting for Approval', 'Completed', 'Out for Delivery', 'Delivered', 'Cancelled']]
    }
  },
  delivery_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  actual_delivery_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  delivery_time: {
    type: DataTypes.STRING,
    allowNull: true
  },
  special_instructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  total_amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  payment_method: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['cash on delivery', 'UPI', 'Net Banking', 'Bank Transfer', 'Online']]
    }
  },
  invoice_generated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false
  },
  postal_code: {
    type: DataTypes.STRING,
    allowNull: false
  },
  delivery_contact_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  delivery_contact_phone: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'orders',
  timestamps: true
});

// ✅ Associations
Orders.belongsTo(CustomerProfile, { foreignKey: 'customer_id' });
Orders.belongsTo(DriversDetails, { foreignKey: 'driver_id' });



DriversDetails.hasMany(Orders, { foreignKey: 'driver_id' });
CustomerProfile.hasMany(Orders, { foreignKey: 'customer_id' });


module.exports = Orders;
