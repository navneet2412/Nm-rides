const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Driverwallet = sequelize.define("driverwallet", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  driverId: {
    type: Sequelize.INTEGER,
    // references: {
    //   model: Car,
    //   key: "id",
    // },
  },
  walletBalance: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});

module.exports = Driverwallet;
