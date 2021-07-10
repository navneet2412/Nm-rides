const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Lifecycletransaction = sequelize.define("lifecycletransaction", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  driverId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  amount: {
    type: Sequelize.DOUBLE,
    allowNull: true,
  },
  type: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  usedFor: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = Lifecycletransaction;