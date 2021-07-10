const Sequelize = require("sequelize");

const sequelize = require("../util/database");
const Car = require("./car-model");

const CabDetails = sequelize.define("cab", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  licence: {
    type: Sequelize.TEXT,
  },
  carModel: {
    type: Sequelize.INTEGER,
    references: {
      model: Car,
      key: 'id',
    }
  },
  manufactureYear: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  cabNumber: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  isActive: {
    type: Sequelize.BOOLEAN,
  }
});

module.exports = CabDetails;
