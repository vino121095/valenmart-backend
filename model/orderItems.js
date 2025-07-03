const { Sequelize } = require('sequelize');
const db = require('../Config/db');
const { DataTypes } = Sequelize;
const Orders = require('./orders');
const Products = require('./products');

const OrderItems = db.define('OrderItems', {
    order_item_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Orders,
        key: 'oid'
      },
      onDelete: 'CASCADE'
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Products,
        key: 'pid'
      },
      onDelete: 'CASCADE'
    },
    quantity: {
      type: DataTypes.STRING,
      allowNull: false
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    line_total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      get() {
        const qty = parseFloat(this.getDataValue('quantity'));
        const price = parseFloat(this.getDataValue('unit_price'));
        return (qty * price).toFixed(2);
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'order_items',
    timestamps: true
  });
  
  // Associations
  OrderItems.belongsTo(Orders, { foreignKey: 'order_id' });
  OrderItems.belongsTo(Products, { foreignKey: 'product_id' });
  
  module.exports = OrderItems;