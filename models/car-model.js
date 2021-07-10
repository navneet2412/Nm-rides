const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Car = sequelize.define("car", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  modelName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  modelDescription: {
    type: Sequelize.TEXT,
    allowNull: false,
  }
});

module.exports = Car;
