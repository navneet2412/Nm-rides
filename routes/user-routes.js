const express = require("express");
const {body} = require('express-validator');

//importing users' controller
const userController = require("../controllers/userController");

//importing middleware for auth
const {isUser} = require("../middleware/isUser");

const router = express.Router();

//fetch user by their id
router.get("/fetch-user",isUser, userController.fetchUser);

//fetch driver for a particular city
router.post("/fetch-drivers", isUser, userController.fetchDrivers);

//update user profile
router.post("/update-user", isUser, userController.updateUser);

//initiate order
router.post("/create-order", isUser, userController.createOrder);

module.exports = router;
