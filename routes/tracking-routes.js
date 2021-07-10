const express = require("express");
const router = express.Router();

//importing tracking controller
const trackingController = require("../controllers/trackingController");

router.get("/:id", trackingController.getLiveDetails);

module.exports = router;