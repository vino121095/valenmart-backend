const { Sequelize } = require('sequelize');
const db = require('../Config/db.js');
const { DataTypes } = Sequelize;

const User = db.define('User', {
  uid: {
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
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  profile_image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  googleId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  facebookId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  authProvider: {
    type: DataTypes.ENUM('local', 'google', 'facebook'),
    allowNull: false,
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resetPasswordExpires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'users',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['email']
    }
  ]
});

module.exports = User;
