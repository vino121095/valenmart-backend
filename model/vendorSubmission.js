const { Sequelize } = require('sequelize');
const db = require('../Config/db.js');
const { DataTypes } = Sequelize;
const Vendor = require('./vendor');

const VendorSubmission = db.define('VendorSubmission', {
    submission_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    vendor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Vendor,
            key: 'vendor_id'
        }
    },
    submission_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['Pending', 'Approved', 'Rejected']]
        }
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    valid_until: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'vendor_submissions',
    timestamps: false
});

// Associations
VendorSubmission.belongsTo(Vendor, { foreignKey: 'vendor_id' });

module.exports = VendorSubmission;
