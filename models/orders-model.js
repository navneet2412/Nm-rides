const Sequelize = require("sequelize");

const sequelize = require("../util/database");
const UserId = require("./user-model");
const DriverId = require("./driver-model");

const OrdersModel = sequelize.define("orders", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  userId: {
    type: Sequelize.INTEGER,
    references: {
      model: UserId,
      key: 'id',
    },
  },
  driverId: {
    type: Sequelize.INTEGER,
    references: {
      model: DriverId,
      key: 'id',
    },
  },
  otp: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  rideStartTime: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  rideEndTime: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  addressStartingPoint: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  fromLat: {
    type: Sequelize.DOUBLE,
    allowNull: true,
  },
  fromLng: {
    type: Sequelize.DOUBLE,
    allowNull: true,
  },
  addressDestination: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  toLat: {
    type: Sequelize.DOUBLE,
    allowNull: true,
  },
  toLng: {
    type: Sequelize.DOUBLE,
    allowNull: true,
  },
  orderStatus: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  paymentType: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  isCancelled: {
    type: Sequelize.BOOLEAN,
    allowNull: true,
  },
  amount: {
    type: Sequelize.DOUBLE,
    allowNull: true,
  }
});

module.exports = OrdersModel;
