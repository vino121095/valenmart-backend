const { Sequelize, DataTypes } = require('sequelize');
const db = require('../Config/db');

const DriverLoginLog = db.define('DriverLoginLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  driver_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  login_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  logout_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  log_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
}, {
  tableName: 'driver_login_logs',
  timestamps: true
});

module.exports = DriverLoginLog;
