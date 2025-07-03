const { Sequelize } = require('sequelize');
const db = require('../Config/db');
const { DataTypes } = Sequelize;
const Products = require('./products');

const Inventory = db.define('Inventory', {
  inventory_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Products,
      key: 'pid'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  quantity_in_stock: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  unit_price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  reorder_level: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  last_restocked: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'inventory',
  timestamps: true
});

// Define association
Products.hasOne(Inventory, { foreignKey: 'product_id' });
Inventory.belongsTo(Products, { foreignKey: 'product_id' });

module.exports = Inventory;
