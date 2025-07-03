const { Sequelize } = require("sequelize");
const db = require("../Config/db");
const { DataTypes } = Sequelize;

const Setting = db.define("Setting",
  {
    sid: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    site_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    site_description: {
      type: DataTypes.STRING(500), // Allow up to 500 characters
      allowNull: true,
    },
    contact_mail: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true, // Ensures valid email format
      },
    },
    facebook_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    instagram_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    linkedin_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    youtube_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    about: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    contact_no: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isNumeric: true,
      },
    },
    site_icon: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    site_logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    site_dark_logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "settings",
    timestamps: true,
  }
);

module.exports = Setting;
