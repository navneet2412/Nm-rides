const {validationResult} = require('express-validator');
const {Sequelize} = require("sequelize");
const datetime = require("node-datetime");
const {fetchDistanceFromGoogle} = require("../helpers/distanceCalculator");
const {acceptedDriverDetails, sendRideDetails, sendCompletedRideDetails} = require("../helpers/sendOTP");

const Op = Sequelize.Op;

//importing the users' model
const User = require("../models/user-model");
const Cab = require("../models/cab-details");
const Driver = require("../models/driver-model");
const Orders = require("../models/orders-model");
const Price = require("../models/pricing-model");
const MissedRide = require("../models/missed-ride-model");

const DriverWallet = require("../models/driver-wallet-model");
const LifecycleWallet = require("../models/lifecycle-wallet-model");
const Lifecycletransaction = require("../models/lifecycle-transaction-model");
const Drivertransaction = require("../models/driver-transaction-model");

User.hasMany(Orders);
Orders.belongsTo(User);
Driver.hasMany(Orders);
Orders.belongsTo(Driver);

//add driver details
exports.profileDetails = async (req, res, next) => {
  // Finds the validation errors in this request and
  // wraps them in an object with handy helpers
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()});
  }

  const {fName, lName, email, gender, dob} = req.body;

  try {
    //  now update the driver's data with the new driver object
    await Driver.update({
      fName,
      lName,
      email,
      gender,
      dob,
    }, {
      where: {
        id: req.userId,
      }
    });
    //  now send the response
    return res.status(201).json({
      msg: `Driver details updated!`,
    });

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

//update driver profile
exports.uploadImage = async (req, res, next) => {
  const image = req.file;
  let imageUrl = '';
  if (image) {
    imageUrl = req.file.path;
  } else {
    return res.status(404).json({
      msg: 'No image provided',
    });
  }
  try {
    //  now update the driver's data with the new driver object
    await Driver.update({
      profileURL: imageUrl,
    }, {
      where: {
        id: req.userId,
      }
    });
    //  now send the response
    return res.status(201).json({
      msg: `Driver profile pic updated!`,
      imageURL: imageUrl
    });

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

//fetch driver details
exports.fetchDriver = async (req, res, next) => {
  // Finds the validation errors in this request and
  // wraps them in an object with handy helpers
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()});
  }

  try {
    const driverDetails = await Driver.findByPk(req.userId);
    return res.status(200).json({msg: driverDetails});
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

//update the driver location
exports.setLocation = async (req, res, next) => {
  const {lat, lng} = req.body;
  //console.log(lat,lng,req);
  try {
    await Driver.update({
      lat, lng
    }, {
      where: {id:req.userId}
    });
    res.status(201).json({
      msg: `Driver location updated successfully`,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

//update the driving licence and
exports.updateLicence = async (req, res, next) => {
  const {drivingLicence, licenceExpiry} = req.body;
  try {
    await Driver.update({
      drivingLicence, licenceExpiry
    }, {
      where: {id: req.userId}
    });
    res.status(201).json({
      msg: `Driver licence updated successfully`,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

//set cab type of the driver
exports.setCabType = async (req, res, next) => {
  const {cabType} = req.body;
  try {
    await Driver.update({
      cabType
    }, {
      where: {id: req.userId}
    });
    res.status(201).json({
      msg: `Driver cab type updated successfully`,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

//check past orders
exports.getPastOrders = async (req, res, next) => {
  // Finds the validation errors in this request and
  // wraps them in an object with handy helpers
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()});
  }

  const {offset, limit} = req.body;
  try {
    const pastOrders = await Orders.findAndCountAll({
      where: {
        driverId: req.userId
      },
      offset: Number.parseInt(offset),
      limit: Number.parseInt(limit),
      order: [
        ['createdAt', 'DESC']
      ]
    });
    res.status(200).json({
      msg: `Orders fetched successfully`,
      orders: pastOrders
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

//accept order
exports.acceptOrder = async (req, res, next) => {
  const {orderId} = req.body;

  const driverId = await Orders.findOne({
    where: {
      id: orderId
    }
  }, {
    attributes: ['driverId']
  });

  if (!driverId['dataValues']['driverId']) {
    //this means no driver is assigned yet
    try {
      await Orders.update({
        driverId: req.userId,
      }, {
        where: {
          id: orderId,
        }
      });

      //update the data of the driver who accepts the order
      await MissedRide.update({
        rideMissed: false,
      }, {
        where: {
          orderId,
        }
      });

      const orderDetails = await Orders.findOne({
        where: {
          id: 1,
        },
        include: [User, Driver]
      });

      const cabNumber = await Cab.findOne({
        where: {
          id: orderDetails['dataValues']['driver']['cabId'],
        },
        attributes: ['cabNumber']
      });

      const msg = `Your SIYOR Ride is arriving soon.
Look for Driver ${orderDetails['dataValues']['driver']['fName']} ${orderDetails['dataValues']['driver']['lName']} with Vehicle No. ${cabNumber['cabNumber']}, Contact driver at ${orderDetails['dataValues']['driver']['phone']}.
Happy Journey.`;

      const phone = orderDetails['dataValues']['user']['phone'];
      await acceptedDriverDetails(msg, phone);

      res.status(201).json({
        msg: 'Driver assigned'
      });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500
      }
      next(err);
    }
  } else {
    //  driver was assigned
    res.status(201).json({
      msg: 'Driver is already assigned'
    });
  }
}

//toggle driver availability
exports.toggleDriverAvailability = async (req, res, next) => {
  try {
    const driver = await Driver.findByPk(req.userId);
    // console.log(!driver.dataValues.isWorking);
    await Driver.update({
      isWorking: !driver.dataValues.isWorking,
    }, {
      where: {
        id: req.userId,
      }
    });
    res.status(200).json({msg: `Driver status changed`});
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err);
  }
}

//update Device Token
exports.deviceToken = async (req, res, next) => {
  const {deviceToken} = req.body;
  try {
    await Driver.update({
      deviceToken
    }, {
      where: {id: req.userId}
    });
    res.status(201).json({
      msg: `Driver device token updated successfully`,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

//start ride
//controller to verify order otp

exports.verifyOtp = async (req, res, next) => {
  const {otp, orderId} = req.body;
  try {
    const orderDateTime = datetime.create();
    const bool = await Orders.update({
      orderStatus: 'Started',
      rideStartTime: orderDateTime.format('Y-m-d H:M:S').toString(),
    }, {
      where: {
        [Op.and]: [{id: orderId}, {otp}]
      }
    });

    console.log(bool[0]);

    if (bool[0]) {
      await Driver.update({
        isOccupied: true,
      }, {
        where: {
          id: req.userId,
        }
      });

      console.log("line no 342 is here1111111111111");
      
      const orderDetails = await Orders.findOne({
        where: {
          id: orderId,
        },
        include: [User]
      });
      console.log(orderDetails['dataValues']['user']['phone']);
      await sendRideDetails(orderId, orderDetails['dataValues']['user']['phone']);

      res.status(201).json({
        msg: 'Ride started'
      });
    } else {
      res.status(422).json({
        msg: 'Invalid data'
      }); 
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

//controller to mark ride complete
exports.markRideComplete = async (req, res, next) => {
  const {orderId} = req.body;
  try {
    const orderEndDateTime = datetime.create();
    const bool = await Orders.update(
      {
        orderStatus: "Complete",
        rideEndTime: orderEndDateTime.format("Y-m-d H:M:S").toString(),
      },
      {
        where: {
          id: orderId,
        },
      }
    );

    if (bool[0] === 0) {
      return res.status(422).json({
        msg: "Invalid data",
      });
    }

    let orderDetails = await Orders.findByPk(orderId);
    const {
      fromLat,
      fromLng,
      toLat,
      toLng,
      rideStartTime,
      rideEndTime,
    } = orderDetails["dataValues"];
    const diff = Math.abs(new Date(rideStartTime) - new Date(rideEndTime));
    const time = Math.floor(diff / 1000 / 60);
    const data = await fetchDistanceFromGoogle(fromLat, fromLng, toLat, toLng);
    let distance = (data.rows[0].elements[0].distance.value / 1000).toFixed(2);
    const priceDetails = await Price.findByPk(1);
    const {
      baseFare,
      perMinuteCharge,
      perKMCharge,
      insuranceCharge,
    } = priceDetails["dataValues"];
    const fare =
      insuranceCharge +
      distance * perKMCharge +
      (distance > 5 ? 5 * baseFare : baseFare * distance) +
      (time > 5
        ? (time - 5) * 0.75 + perMinuteCharge * 5
        : time * perMinuteCharge);

    await Orders.update(
      {
        amount: fare,
        isCancelled: false,
      },
      {
        where: {
          id: orderId,
        },
      }
    );

    orderDetails = await Orders.findOne({
      where: {
        id: orderId,
      },
      include: [User],
    });

    //Navneet's code starts here....(code for wallets)
    const driverId = orderDetails["dataValues"]["driverId"];
    const amountPaid = amount;
    // const walletBalance=100000;

    //   LifecycleWallet.create({
    //     walletBalance
    //   })

    let commission = 0.2;
    let commissionAmount = amountPaid * commission;
    amountPaid = amountPaid - commissionAmount;

    const currentLifecycle = await LifecycleWallet.findOne({
      order: [["createdAt", "DESC"]],
    });
    let walletBalance = currentLifecycle.walletBalance - amountPaid;

    const currentLifecycleBalance = await LifecycleWallet.update(
      {
        walletBalance,
      },
      { where: { id: 1 } }
    );

    const driver = await DriverWallet.findOne({
      where: {
        driverId,
      },
    });

    let currentDriverBalance;
    if (!driver) {
      walletBalance = Number.parseFloat(amountPaid);
      currentDriverBalance = await DriverWallet.create({
        driverId,
        walletBalance,
      });
    } else {
      walletBalance =
        Number.parseFloat(driver.walletBalance) + Number.parseFloat(amountPaid);
      await DriverWallet.update(
        {
          walletBalance,
        },
        { where: { driverId: driverId } }
      );
    }
    currentDriverBalance = await DriverWallet.findOne({
      where: { driverId: driverId },
    });

    let amount = amountPaid;
    let type = "credit";
    let usedFor = "transaction";
    const drivertransactiondetail = await Drivertransaction.create({
      driverId,
      amount,
      type,
      usedFor,
    });

    type = "debit";
    amount = amountPaid;
    const lifecycletransactiondetail = await Lifecycletransaction.create({
      driverId,
      amount,
      type,
      usedFor,
    });

    usedFor = "commision";
    amount = commissionAmount;
    await Drivertransaction.create({
      driverId,
      amount,
      type,
      usedFor,
    });

    type = "credit";
    await Lifecycletransaction.create({
      driverId,
      amount,
      type,
      usedFor,
    });

    //ends here!

    await Driver.update(
      {
        isOccupied: false,
      },
      {
        where: {
          id: req.userId,
        },
      }
    );

    await sendCompletedRideDetails(
      fare,
      orderDetails["dataValues"]["user"]["phone"]
    );
    await sendRideDetails(orderId, orderDetails['dataValues']['user']['phone']);

    res.status(201).json({
      msg: "Ride marked complete!",
      orderDetails,
      fare,
      currentDriverBalance,
      currentLifecycleBalance,
      drivertransactiondetail,
      lifecycletransactiondetail,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

//controller to show driver stats
exports.showStats = async (req, res, next) => {
  const {fromDate, toDate} = req.body;
  try {
    const {count, rows} = await Orders.findAndCountAll({
      where: {
        driverId: req.userId,
        createdAt: {
          [Op.between]: [fromDate, toDate],
        },
        orderStatus: 'Complete',
      },
      attributes: ['amount']
    });

    let totalAmount = 0;
    for (let i = 0; i < rows.length; i++) {
      totalAmount += rows[i].amount
    }

    res.status(201).json({
      msg: 'Driver stats for completed orders',
      count,
      totalAmount,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

//controller to track missed ride
exports.rideMissed = async (req, res, next) => {
  const {fromDate, toDate} = req.body;
  try {
    const {count, rows} = await MissedRide.findAndCountAll({
      where: {
        driverId: req.userId,
        createdAt: {
          [Op.between]: [fromDate, toDate],
        },
      }
    });
    res.status(200).json({
      msg: 'Driver stats for missed rides',
      rideMissed: count
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}