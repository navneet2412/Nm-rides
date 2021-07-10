const Orders = require("../models/orders-model");
const User = require("../models/user-model");
const Driver = require("../models/driver-model");

User.hasMany(Orders);
Orders.belongsTo(User);
Driver.hasMany(Orders);
Orders.belongsTo(Driver);

exports.paymentDetails = async (req, res, next) => {
  const {id} = req.params;
  try {
    const orderDetails = await Orders.findOne({
      where: {
        id,
      },
      include: [User, Driver]
    });
    res.render('index', {orderDetails});
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}