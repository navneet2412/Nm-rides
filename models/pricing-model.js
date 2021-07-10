const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Price = sequelize.define("price", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  baseFare: {
    type: Sequelize.DOUBLE,
    allowNull: true,
  },
  perMinuteCharge: {
    type: Sequelize.DOUBLE,
    allowNull: true,
  },
  perKMCharge: {
    type: Sequelize.DOUBLE,
    allowNull: true,
  },
  insuranceCharge: {
    type: Sequelize.DOUBLE,
    allowNull: true,
  }
});

module.exports = Price;
