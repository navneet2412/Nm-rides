const Sequelize = require("sequelize");

const sequelize = require("../util/database");
const Driver = require("./driver-model");
const Order = require("./orders-model");

const MissedRide = sequelize.define("missed_ride", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  driverId: {
    type: Sequelize.INTEGER,
    references: {
      model: Driver,
      key: 'id',
    }
  },
  orderId: {
    type: Sequelize.INTEGER,
    references: {
      model: Order,
      key: 'id',
    }
  },
  rideMissed: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
  }
});

module.exports = MissedRide;
