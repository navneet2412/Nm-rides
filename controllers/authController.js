const {validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');
const functions = require('../helpers/generateOTP');
const admin = require("firebase-admin");

//importing all the models
const User = require("../models/user-model"); 
const Driver = require("../models/driver-model");

//importing helper functions
const {sendOTP} = require("../helpers/sendOTP");
const {isPhoneUnique} = require("../helpers/isPhoneUnique");

//for authentication of user
exports.userAuth = async (req, res, next) => {
  await authMethod(req, res, next, User);
}

//for authentication of driver
exports.driverAuth = async (req, res, next) => {
  await authMethod(req, res, next, Driver);
}

//for OTP verification of user
exports.userOTPVerification = async (req, res, next) => {
  await verifyOTP(req, res, next, User);
}

//for OTP verification of driver
exports.driverOTPVerification = async (req, res, next) => {
  await verifyOTP(req, res, next, Driver);
}

//authentication helper method
const authMethod = async (req, res, next, Model) => {
  // Finds the validation errors in this request and
  // wraps them in an object with handy helpers
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()});
  }
  
  //store the data from the form body in a variable
  const {phone} = req.body;
  
  //generate a random otp for phone verification
  const otp = Number.parseInt(functions.generateOTP(6));
  
  //sending otp to the user
  try {
    const response = await sendOTP(otp, phone);
    
    //will save the data once the sms sent returns 200 status code
    if (response.status === 200) {
      
      //check if the number is unique or not
      //if the number id unique, save the number in the db
      //and then send them the otp or else directly send them the otp
      const isUnique = await isPhoneUnique(Model, phone);
      //this means user exists, we'll just send him the otp
      // for login and update the OTP column in the db
      if (!isUnique) {
        await Model.update({otp}, {
          where: {phone}
        });
        res.status(201).json({
          msg: `User already exists. OTP sent to ${phone}`,
          code: 1, //for user already registered
        });
      } else {
        const referCode = functions.generateString(3).trim() + functions.generateString(3).trim();
        await Model.create({
          phone,
          otp,
          referCode
        });
        res.status(201).json({
          msg: `User registered! OTP sent to ${phone}`,
          code: 0, //for user not registered
        });
      }
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

//OTP helper method
//we'll return them auth token
const verifyOTP = async (req, res, next, Model) => {
  
  try {
    // Finds the validation errors in this request and
    // wraps them in an object with handy helpers
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }
    //store the data from the form body in a variable
    const {phone, otp} = req.body;
    const user = await Model.findOne({where: {phone, otp}});
    if (!user) {
      return res.status(404).json({msg: `No user found!`});
    }
    const id = user["dataValues"]["id"];
    
    const token = jwt.sign({
      id,
      phone
    }, 'your_secret_key', {
      expiresIn: '90 days'
    });
    await Model.update({
      isVerified: true,
    }, {where: {phone}});
    res.status(201).json({
      msg: `Phone number ${phone} verified successfully`,
      token: token,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.userReferer = async (req, res, next) => {
  await referredBy(req, res, next, User);
}

exports.driverReferer = async (req, res, next) => {
  await referredBy(req, res, next, Driver);
}

const referredBy = async (req, res, next, Model) => {
  try {
    const {phone, referCode} = req.body;
    const user = await Model.findOne({where: {referCode}});
    if (!user) {
      return res.status(404).json({msg: `Invalid refer code!`});
    }
    const id = user["dataValues"]["id"];
    await Model.update({
      referredBy: id,
    }, {where: {phone}});
    //logic for sending push notification
    const message = {
      notification: {
        title: 'New Order',
        body: `Thanks for referring ${phone}`
      },
      token: user['dataValues']['deviceToken'],
    }
    try {
      const firebaseResponse = await admin.messaging().send(message);
      console.log(firebaseResponse);
    } catch (err) {
      console.log(`Something went wrong: ${err}`)
    }
    res.status(201).json({
      msg: `Referral code verified successfully`
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}