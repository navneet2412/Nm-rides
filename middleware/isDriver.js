const jwt = require("jsonwebtoken");

//importing driver model
const Driver = require("../models/driver-model");

exports.isDriver = async (req, res, next) => {
  
  const authHeader = req.get('Authorization');
  
  try {
    if (!authHeader) {
      const err = new Error("Not authorized");
      err.statusCode = 401;
      return next(err);
    }
    
    const token = authHeader.split(' ')[1]; //Authorization header looks like {Authorization: 'Bearer ' + this.props.token} on the front end
    let decodedToken;
    
    decodedToken = jwt.verify(token, 'your_secret_key');
    if (!decodedToken) {
      const error = new Error('Not Authorized');
      error.statusCode = 401;
      next(error);
    }
    const driver = await Driver.findOne({where: {phone: decodedToken.phone}});
    if (!driver) {
      const error = new Error('Driver not found');
      error.statusCode = 404;
      next(error);
    }
    req.userId = decodedToken.id; //setting driverId to request
    req.phone = decodedToken.phone;
    next();
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}