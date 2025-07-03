const { Sequelize } = require('sequelize');
const db = require('../Config/db.js');
const { DataTypes } = Sequelize;
const User = require('./user');

const Vendor = db.define('Vendor', {
    vendor_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    type: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            isIn: [['Vendor', 'Farmer']]
        }
    },
    contact_person: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    city: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    state: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    pincode: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    registration_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['Active', 'Inactive', 'Pending']]
        }
    }
}, {
    tableName: 'vendor',
    timestamps: true
});

// Associations
Vendor.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Vendor;
