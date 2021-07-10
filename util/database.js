const Sequelize = require("sequelize");


const sequelize = new Sequelize(
  "mysql://bbd8ad8f3d2a21:65f3d138@eu-cdbr-west-03.cleardb.net/heroku_0022d4615b5a70b?reconnect=true",
  {
    dialect: "mysql",
    logging: false,
  }
);



module.exports = sequelize;
