const { validationResult } = require("express-validator");
const sequelize = require("../util/database");

const DriverWallet = require("../models/driver-wallet-model");
const LifecycleWallet = require("../models/lifecycle-wallet-model");
const Lifecycletransaction = require("../models/lifecycle-transaction-model");
const Drivertransaction = require("../models/driver-transaction-model");


exports.handleWallets = async (req, res, next) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  
  const {amountPaid,driverId} = req.body;

  try {
    // const walletBalance=100000;
      
    //   LifecycleWallet.create({
    //     walletBalance
    //   })
      
      let commission=0.2;
      let commissionAmount = amountPaid * commission;
      amountPaid=amountPaid-commissionAmount;
     

     const currentLifecycle = await LifecycleWallet.findOne({
        order: [["createdAt", "DESC"]],
      });
     let walletBalance = currentLifecycle.walletBalance-amountPaid;

    const currentLifecycleBalance= await LifecycleWallet.update({
       walletBalance
     },{where:{id:1}});
      
      const driver = await DriverWallet.findOne({
        where:{
          driverId
        }
      });
      
      let currentDriverBalance;
      if(!driver){
          walletBalance = Number.parseFloat(amountPaid);
          currentDriverBalance= await DriverWallet.create({
          driverId,
          walletBalance
        });
      }
      else{
          walletBalance =
            Number.parseFloat(driver.walletBalance) +
            Number.parseFloat(amountPaid);
            await DriverWallet.update({
          walletBalance,
        }, {where: {driverId:driverId}});
      }
     currentDriverBalance= await DriverWallet.findOne({
         where: { driverId: driverId } 
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

      type="debit";
      amount = amountPaid;
      const lifecycletransactiondetail = await Lifecycletransaction.create({
       driverId,
       amount,
       type,
       usedFor,
      });

      usedFor="commision";
      amount=commissionAmount;
      await Drivertransaction.create({
        driverId,
        amount,
        type,
        usedFor,
      });

      type="credit"
      await Lifecycletransaction.create({
        driverId,
        amount,
        type,
        usedFor,
      });


      res.status(200).json({
      msg: "wallet money added!!!!!",
      currentDriverBalance,
      currentLifecycleBalance,
      drivertransactiondetail,
      lifecycletransactiondetail
    });
    
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};