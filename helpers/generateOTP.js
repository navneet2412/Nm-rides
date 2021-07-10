//code to generate OTP
exports.generateOTP = (length) => {
  const string = '123456789';
  let OTP = '';
  const len = string.length;
  for (let i = 0; i < length; i++) {
    OTP += string[Math.floor(Math.random() * len)];
  }
  return OTP;
};

//code to generate some random string
const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

exports.generateString = (length) => {
  let result = ' ';
  const charactersLength = characters.length;
  for ( let i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  
  return result;
}