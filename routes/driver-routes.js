const express = require("express");
const {body} = require('express-validator');

//importing users' controller
const driverController = require("../controllers/driverController");

//importing driver's middleware
const {isDriver} = require("../middleware/isDriver");

const router = express.Router();

//fetch driver by their id
router.get("/fetch-driver", isDriver, driverController.fetchDriver);

//fetch driver's past orders
router.get("/past-orders", isDriver, driverController.getPastOrders);

//fetch missed ride details
router.get("/missed-ride", isDriver, driverController.rideMissed);

//fetch driver's past order details date
router.post("/stats", isDriver, driverController.showStats);

//update the driver location
router.post("/set-location", isDriver, driverController.setLocation);

//profile details complete route
router.post("/profile", isDriver, [
  body('fName')
    .not().isEmpty()
    .trim()
    .escape().withMessage("Field required"),
  body('lName')
    .not().isEmpty()
    .trim()
    .escape().withMessage("Field required"),
  body('email')
    .isEmail()
    .normalizeEmail().withMessage("Should be in a valid email" +
    " format"),
  body('gender')
    .not().isEmpty()
    .trim()
    .escape().withMessage("Gender should be either male or female"),
], driverController.profileDetails);

//route to update the driver licence and the expiry date
router.post("/update-licence", isDriver, driverController.updateLicence);

//router for setting cab type
router.post("/cab-type", isDriver, driverController.setCabType);

//route for driver to accept the order
router.post("/accept-order", isDriver, driverController.acceptOrder);

//route to toggle driver availability
router.post("/toggle-availability", isDriver, driverController.toggleDriverAvailability);

//route to upload profile pic
router.post("/upload-image", isDriver, driverController.uploadImage);

//router to update the driver's device token
router.post("/device-token", isDriver, driverController.deviceToken);

//router to verify the otp and start the ride
router.post("/verify-otp", isDriver, driverController.verifyOtp);

//route to mark ride complete
router.post("/mark-ride-complete", isDriver, driverController.markRideComplete);

module.exports = router;
