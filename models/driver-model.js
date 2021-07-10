const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const CabId = require("./cab-details");

const Driver = sequelize.define("driver", {
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
  fName: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  lName: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  dob: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  drivingLicence: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  licenceExpiry: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  isWorking: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  isOccupied: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  phone: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  gender: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  profileURL: {
    type: Sequelize.STRING,
    allowNull: true,
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
  },
  cabId: {
    type: Sequelize.INTEGER,
    references: {
      model: CabId,
      key: 'id',
    },
  },
  cabType: {
    type: Sequelize.STRING,
    allowNull: true,
  }
});

module.exports = Driver;
