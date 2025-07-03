const { Sequelize } = require('sequelize');
const db = require('../Config/db.js');
const { DataTypes } = Sequelize;

const Admin = db.define('Admin', {
    aid: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    tableName: 'admin',
    timestamps: true,
});

module.exports = Admin;
