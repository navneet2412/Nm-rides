const {validationResult} = require('express-validator');
const {distanceCalculator} = require("../helpers/distanceCalculator");
const {sendRideOTP} = require("../helpers/sendOTP");
const functions = require('../helpers/generateOTP');
const sequelize = require("../util/database");
const { QueryTypes } = require("sequelize");

const admin = require("firebase-admin");
const db = admin.database();

const ref = db.ref("order_stat");

//importing the driver's model
const Driver = require("../models/driver-model");
const User = require("../models/user-model");
const Orders = require("../models/orders-model");
const MissedRide = require("../models/missed-ride-model");


//for updating user's details like email and name
exports.fetchDrivers = async (req, res, next) => {

  // Finds the validation errors in this request and
  // wraps them in an object with handy helpers
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()});
  }

  const availableDrivers = [];

  const {lat, lng} = req.body;

  try {
    //driver must be available and not occupied
    const drivers = await Driver.findAll({
      where: {
        lat,
        lng,
        isWorking: true,
        isOccupied: false,
      },
      attributes: ['id', 'deviceToken', 'lat', 'lng', 'cabType'],
    });

    if (drivers.length === 0) {
      return res.status(404).json({msg: "No drivers available"});
    }
    drivers.map(driver => {
      const distance = distanceCalculator({
        lat,
        lng
      }, {lat: driver.lat, lng: driver.lng});
      // todo: change this hardcoded distance to dynamic from the database
      if (distance <= 10000) {
        availableDrivers.push(driver);
      }
    });
    res.status(200).json({drivers: availableDrivers});
    //your code here
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

//fetching the data of the user form the user's end
exports.fetchUser = async (req, res, next) => {
  // Finds the validation errors in this request and
  // wraps them in an object with handy helpers
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()});
  }

  //fetch the id from the req body
  const id = req.userId;

  try {
    const userDetails = await User.findOne({
      where: {
        id
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

//update profile
exports.updateUser = async (req, res, next) => {
  // Finds the validation errors in this request and
  // wraps them in an object with handy helpers
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()});
  }
  //fetch the id from the req body
  const {name, email} = req.body;
  try {
    const userDetails = await User.update({
      name, email
    }, {
      where: {
        id: req.userId,
      }
    });
    res.status(200).json({msg: `User details updated`});
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

//createOrder
exports.createOrder = async (req, res, next) => {
  //store the data from the req body in a var
  const {
    currentLocation,
    lat,
    lng,
    toLat,
    toLng,
    finalLocation,
    orderStatus,
    paymentType,
  } = req.body;
  const otp = Number.parseInt(functions.generateOTP(4));
  try {
    // drivers with the order id
    const availableDrivers = [];
    //logic for fetching and sending push notification to the driver
    // const drivers = await Driver.findAll({
    //   where: {
    //     lat,
    //     lng,
    //     isWorking: true,
    //     isOccupied: false
    //   },
    //   attributes: ['id', 'deviceToken', 'lat', 'lng', 'cabType'],
    // });

     const results = await sequelize.query(
       `SELECT * , 6371 * 2 * ASIN(SQRT(POWER(SIN(RADIANS(${lat} - ABS(drivers.lat))), 2) + COS(RADIANS(${lat})) * COS(RADIANS(ABS(drivers.lat))) * POWER(SIN(RADIANS(${lng} - drivers.lng)), 2))) AS distance FROM drivers having distance<30`,
       { type: QueryTypes.SELECT }
     );
    const drivers=results;

    console.log(drivers,"drivers hereeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");

    if (drivers.length === 0) {
      return res.status(404).json({msg: "No drivers available"});
    }
 //return res.status(200).json({drivers:drivers[0]});
    //create new order here if the driver is available
    const response = await Orders.create({
      userId: req.userId,
      addressStartingPoint: currentLocation,
      fromLat: lat,
      fromLng: lng,
      toLat: toLat,
      toLng: toLng,
      addressDestination: finalLocation,
      orderStatus,
      paymentType,
      otp,
    });

    const orderId = response['dataValues']['id'];

    drivers.map(driver => {
      const distance = distanceCalculator({
        lat,
        lng
      }, {lat: driver.lat, lng: driver.lng});
      if (distance <= 30000) {
        availableDrivers.push(driver);
      }
    });
 
    //here the individual driver's status is changed in firebase
    for (let i = 0; i < availableDrivers.length; i++) {
      const driverId = availableDrivers[i]['id'];
      //Add the driver in missed ride model
      await MissedRide.create({
        driverId,
        orderId
      });

      const driverRef = ref.child(availableDrivers[i]['id']);
      await driverRef.set({
        current_status: 1,
        order: {
          id: orderId,
          userAddress: currentLocation,
          addressDestination: finalLocation,
          mobileNumber: req.phone,
          name: "Guest",
          lat,
          lng,
          toLat,
          toLng
        }
      });

      //logic for sending push notification
      const message = {
        notification: {
          title: 'New Order',
          body: 'Open app to confirm new order'
        },
        token: availableDrivers[i]['deviceToken'],
      }
      try {
        const firebaseResponse = await admin.messaging().send(message);
        console.log(firebaseResponse);
      } catch (err) {
        console.log(`Something went wrong: ${err}`)
      }
    }



    const rideOTPMsgResponse = await sendRideOTP(otp, req.phone);
    if (rideOTPMsgResponse.status === 200) {
      return res.status(201).json({
        msg: `Orders created successfully, OTP sent to user's phone`,
        orderId,
        otp
      });
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}