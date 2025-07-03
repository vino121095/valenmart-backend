const { Sequelize } = require('sequelize');
const db = require('../Config/db');
const { DataTypes } = Sequelize;

const Category = db.define('Category', {
    cid: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    category_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
        category_description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
        category_image: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: 'category',
    timestamps: true,
});

module.exports = Category;