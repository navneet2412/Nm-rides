const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const User = sequelize.define("user", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  deviceToken: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  referCode: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  referredBy: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  phone: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  isVerified: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  city: {
    type: Sequelize.STRING,
    allowNull: true
  },
  lat: {
    type: Sequelize.DOUBLE,
    allowNull: true,
  },
  lng: {
    type: Sequelize.DOUBLE,
    allowNull: true,
  },
  otp: {
    type: Sequelize.INTEGER,
    allowNull: false,
  }
});

module.exports = User;
