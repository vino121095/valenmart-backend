const { Sequelize } = require('sequelize');
const db = require('../Config/db');
const { DataTypes } = Sequelize;

const Products = db.define('Products', {
  pid: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  discription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false
  },
  product_image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  is_seasonal: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['summer', 'winter', 'spring', 'autumn', 'All Season']]
    }
  },
  season_start: {
    type: DataTypes.DATE,
    allowNull: true
  },
  season_end: {
    type: DataTypes.DATE,
    allowNull: true
  },
  is_active: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['Available', 'Unavailable']]
    }
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  cgst: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.0,
    validate: {
      min: 0
    }
  },
  sgst: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.0,
    validate: {
      min: 0
    }
  },
  delivery_fee: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.0,
    validate: {
      min: 0
    }
  },
  unit: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'products',
  timestamps: true
});

module.exports = Products;
