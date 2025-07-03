const { Sequelize } = require('sequelize');
const db = require('../Config/db');
const { DataTypes } = Sequelize;
const User = require('./user');

const CustomerProfile = db.define('CustomerProfile', {
  cpid: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
user_id: {
  type: DataTypes.INTEGER,
  allowNull: true,
  references: {
    model: User,
    key: 'uid'
  }
},
  institution_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  institution_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false
  },
  postal_code: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contact_person_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
contact_person_email: {
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
  contact_person_phone: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'customers_profile',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['contact_person_email']
    }
  ]
});

// Define associations
CustomerProfile.belongsTo(User, { 
  foreignKey: 'user_id',
  targetKey: 'uid'
});

module.exports = CustomerProfile;