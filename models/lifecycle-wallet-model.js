const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Lifecyclewallet = sequelize.define("lifecyclewallet", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  walletBalance: {
    type: Sequelize.INTEGER,
    allowNull: false,
   
  },
});

module.exports = Lifecyclewallet;
