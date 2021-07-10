const express = require("express");
const router = express.Router();

//importing tracking controller
const paymentController = require("../controllers/payment-controller");

router.get("/:id", paymentController.paymentDetails);

module.exports = router;