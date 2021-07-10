const jwt = require("jsonwebtoken");

//importing user model
const User = require("../models/user-model");

exports.isUser = async (req, res, next) => {
  
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
      const err = new Error('Not Authorized');
      err.statusCode = 401;
      next(err);
    }
    
    const user = await User.findOne({where: {phone: decodedToken.phone}});
    
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      next(err);
    }
    
    req.userId = decodedToken.id; //setting userId to request
    req.phone = decodedToken.phone;
    next();
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}