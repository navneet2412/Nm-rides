const axios = require('axios');

//otp for mobile number verification
exports.sendOTP = async (generatedOTP, phone) => {
  // let url = `https://api.msg91.com/api/v5/otp?authkey=${process.env.AUTH_KEY}&template_id=${process.env.TEMPLATE_ID}&mobile=${Number.parseInt(91 + phone)}&otp=${generatedOTP}`;
  let url = `https://api.msg91.com/api/sendhttp.php?route=4&sender=TESTIN&mobiles=${Number.parseInt(91 + phone)}&authkey=${process.env.AUTH_KEY}&message=Your otp for login is ${generatedOTP}`;
  try {
    return await axios.get(url);
  } catch (err) {
    console.log(err);
  }
};

//send sms once the driver has accepted the order
exports.acceptedDriverDetails = async (msg, phone) => {
  let url = `https://api.msg91.com/api/sendhttp.php?route=4&sender=TESTIN&mobiles=${Number.parseInt(91 + phone)}&authkey=${process.env.AUTH_KEY}&message=${msg}`;
  try {
    return await axios.get(url);
  } catch (err) {
    console.log(err);
  }
}

//otp for starting the ride
exports.sendRideOTP = async (generatedOTP, phone) => {
  // let url = `https://api.msg91.com/api/v5/otp?authkey=${process.env.AUTH_KEY}&template_id=${process.env.RIDE_TEMPLATE_ID}&mobile=${Number.parseInt(91 + phone)}&otp=${generatedOTP}`;
  let url = `https://api.msg91.com/api/sendhttp.php?route=4&sender=TESTIN&mobiles=${Number.parseInt(91 + phone)}&authkey=${process.env.AUTH_KEY}&message=OTP to start your ride ${generatedOTP}`;
  try {
    return await axios.get(url);
  } catch (err) {
    console.log(err);
  }
};

//send sms with tracking link
exports.sendRideDetails = async (orderId, phone) => {
  const trackingLink = `${process.env.API_URL}/track/${orderId}`;
  let url = `https://api.msg91.com/api/sendhttp.php?route=4&sender=TESTIN&mobiles=${Number.parseInt(91 + phone)}&authkey=${process.env.AUTH_KEY}&message=Track your ride here ${trackingLink}`;
  try {
    console.log("inside send ride details method");
    return await axios.get(url);
  } catch (err) {
    console.log(err);
  }
}

//send sms with ride details and fare on ride completion
exports.sendCompletedRideDetails = async (amount, phone) => {
  const messageAmount = `Rs. ${amount}`;
  let url = `https://api.msg91.com/api/sendhttp.php?route=4&sender=TESTIN&mobiles=${Number.parseInt(91 + phone)}&authkey=${process.env.AUTH_KEY}&message=Thanks for choosing Siyor, please pay ${messageAmount}`;
  try {
    return await axios.get(url);
  } catch (err) {
    console.log(err);
  }
}