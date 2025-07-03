const { Sequelize, DataTypes } = require('sequelize');
const db = require('../Config/db');
const DriverLoginLog = require('./driverLoginLog');

const DriversDetails = db.define('DriversDetails', {
    did: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    date_of_birth: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    vehicle_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    vehicle_number: {
        type: DataTypes.STRING,
        allowNull: false
    },
    vehicle: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['Excellent', 'Good', 'Fair', 'Poor']]
        }
    },
    license_number: {
        type: DataTypes.STRING,
        allowNull: false
    },
    license_expiry_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    id_proof: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    emergency_phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    state: {
        type: DataTypes.STRING,
        allowNull: false
    },
    country: {
        type: DataTypes.STRING,
        allowNull: false
    },
    driver_image: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['Available', 'On Delivery', 'On Break', 'Offline']]
        }
    },
    last_login_time: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    last_logout_time: {
        type: DataTypes.DATE,
        allowNull: true,
    },

}, {
    tableName: 'drivers_details',
    timestamps: true,
});

DriverLoginLog.belongsTo(DriversDetails, { foreignKey: 'driver_id', as: 'driver' });
DriversDetails.hasMany(DriverLoginLog, { foreignKey: 'driver_id', as: 'loginLogs' });

module.exports = DriversDetails;