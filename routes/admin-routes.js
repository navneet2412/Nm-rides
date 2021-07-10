const express = require("express");
const {body} = require('express-validator');

//importing users' controller
const adminController = require("../controllers/adminController");

const router = express.Router();

//fetch driver by their id
router.get("/fetch-driver",[
  body('id').trim().isInt().withMessage("Id field missing or not" +
    " valid")
], adminController.fetchDriver);

//fetch user by their id
router.get("/fetch-user",[
  body('id').trim().isInt().withMessage("Id field missing or not" +
    " valid")
], adminController.fetchUser);

//router for adding new car
router.post("/add-new-car", adminController.addCarDetails);

//router for adding new cab
router.post("/add-new-cab", adminController.addNewCab);

//router for assigning new cab to the driver
router.post("/assign-new-cab", adminController.assignNewCab);

module.exports = router;