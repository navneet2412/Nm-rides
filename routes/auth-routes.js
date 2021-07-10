const express = require("express");
const {body} = require('express-validator');

//importing users' controller
const authController = require("../controllers/authController");

const router = express.Router();

//add a new user or login user
router.post("/user-auth", [
  body('phone').trim().isInt().isLength({min: 10}).withMessage("Phone must be an integer")
], authController.userAuth);

//add a new user or login user
router.post("/driver-auth", [
  body('phone').trim().isInt().isLength({min: 10}).withMessage("Phone must be an integer")
], authController.driverAuth);

//verify user's otp
router.post("/verify-user-otp", [
  body('phone').trim().isInt().isLength({min: 10}).withMessage("Phone must be an integer and of 10 digits"),
  body('otp').trim().isInt().isLength({min: 6}).withMessage("OTP" +
    " must be an integer and of 6 digits")
], authController.userOTPVerification);

//verify driver's otp
router.post("/verify-driver-otp", [
  body('phone').trim().isInt().isLength({min: 10}).withMessage("Phone must be an integer and of 10 digits"),
  body('otp').trim().isInt().isLength({min: 6}).withMessage("OTP" +
    " must be an integer and of 6 digits")
], authController.driverOTPVerification);

//add referred by
router.post('/user-referrer', authController.userReferer);

router.post('/driver-referrer', authController.driverReferer);


module.exports = router;
