const { Sequelize } = require('sequelize');
const db = require('../Config/db');
const Orders = require('./orders');
const { DataTypes } = Sequelize;

const Invoice = db.define('Invoice', {
    invoice_id: {
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
    },
    invoice_number: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    invoice_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    delivery_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    tax_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Paid', 'Canceled', 'Overdue'),
        allowNull: false
    },
    collected_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    collection_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    collected_by: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    payment_mode: {
        type: DataTypes.ENUM('Cash', 'Credit', 'Debit', 'Bank Transfer', 'Online'),
        allowNull: false
    },
    payment_reference: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
}, {
    tableName: 'invoices',
    timestamps: false
});

Invoice.belongsTo(Orders, { foreignKey: 'order_id' });

module.exports = Invoice;