const Orders = require("../models/orders-model");

exports.getLiveDetails = async (req, res, next) => {
  const {id} = req.params;
  try {
    const order = await Orders.findOne({
      where: {
        id
      },
      attributes: ['id', 'toLat', 'toLng'],
    });
    res.redirect(`https://www.google.com/maps/dir/?api=1&travelmode=driving&layer=traffic&destination=${order['dataValues']['toLat']},${order['dataValues']['toLng']}`)
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}