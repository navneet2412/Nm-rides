const {validationResult} = require('express-validator');

const Driver = require("../models/driver-model");
const User = require("../models/user-model");
const Cab = require("../models/cab-details");
const Car = require("../models/car-model");

exports.fetchDriver = async (req, res, next) => {
  // Finds the validation errors in this request and
  // wraps them in an object with handy helpers
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()});
  }

  //fetch the id from the req body
  const {id} = req.body;

  try {
    const driverDetails = await Driver.findOne({
      where: {
        id: id
      }
    });
    res.status(200).json({msg: driverDetails});
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.fetchUser = async (req, res, next) => {
  // Finds the validation errors in this request and
  // wraps them in an object with handy helpers
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()});
  }

  //fetch the id from the req body
  const {id} = req.body;

  try {
    const userDetails = await User.findOne({
      where: {
        id: id
      }
    });
    res.status(200).json({msg: userDetails});
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.addCarDetails = async (req, res, next) => {
  const {modelName, modelDescription} = req.body;
  try {
    await Car.create({
      modelName,
      modelDescription
    });
    res.status(201).json({
      msg: `Car added successfully`
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.addNewCab = async (req, res, next) => {
  const {licence, carModel, manufactureYear, cabNumber, isActive} = req.body;
  try {
    await Cab.create({
      licence, carModel, manufactureYear, cabNumber, isActive
    });
    res.status(201).json({
      msg: `Cab added successfully`
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.assignNewCab = async (req, res, next) => {
  const {driverId, cabId} = req.body;
  try {
    await Driver.update({
      cabId
    }, {
      where: {
        id: driverId,
      }
    });
    res.status(200).json({msg: `Driver assigned with new cab`});
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}