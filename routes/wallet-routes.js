const express = require("express");
const { body } = require("express-validator");
const { isUser } = require("../middleware/isUser");
const{ handleWallets} = require("../controllers/walletController");

const router = express.Router();

router.post("/update-wallet", handleWallets);

module.exports = router;