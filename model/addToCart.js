const { Sequelize } = require('sequelize');
const db = require('../Config/db');
const { DataTypes } = Sequelize;

const CustomerProfile = require('./customerProfile');
const Products = require('./products');

const Cart = db.define('Cart', {
    cart_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: CustomerProfile,
            key: 'user_id'
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
    product_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    price_at_time: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    added_date: {
        type: DataTypes.DATEONLY,
        defaultValue: Sequelize.NOW
    }
}, {
    tableName: 'cart',
    timestamps: true
});

// ✅ Associations
Cart.belongsTo(CustomerProfile, { foreignKey: 'customer_id' });
Cart.belongsTo(Products, { foreignKey: 'product_id' });

CustomerProfile.hasMany(Cart, { foreignKey: 'customer_id' });
Products.hasMany(Cart, { foreignKey: 'product_id' });

module.exports = Cart;
