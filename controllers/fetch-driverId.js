const { validationResult } = require("express-validator");
const Orders = require("../../models/orders-model");

const getdriverId = async (req, res, next) => {
  try {
    // Finds the validation errors in this request and
    // wraps them in an object with handy helpers
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //store the data from the form body in a variable
    const { orderid_for_transaction, amount_for_transaction } = req.body;
    const orderId= orderid_for_transaction;
    const amount=amount_for_transaction;
    const order = await Orders.findOne({ where: { orderId, amount } });
    if (!order.driverId) {
      return res.status(404).json({ msg: `Driver not assigned till now` });
    }
    
    const driverId= order.driverId;
    res.status(201).json({
      msg: `Driverid found!!!!`,
      driverId
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
