const cluster = require("cluster");
const cpu = require("os").cpus().length;

const path = require("path");
const express = require("express");
const multer = require("multer");
const sequelize = require("./util/database");
const helmet = require("helmet");
const compression = require("compression");

// Initialize the app with a service account, granting admin privileges
require("./firebase/firebase-connect");

const User = require("./models/user-model");
const Driver = require("./models/driver-model");
const CarModel = require("./models/car-model");
const CabDetails = require("./models/cab-details");
const PriceModel = require("./models/pricing-model");
const OrderDetails = require("./models/orders-model");
const MissedRideModel = require("./models/missed-ride-model");
const LifecycletransactionModel = require("./models/lifecycle-transaction-model");
const DrivertransactionModel = require("./models/driver-transaction-model");
const DriverwalletModel = require("./models/driver-wallet-model");
const LifecyclewalletModel = require("./models/lifecycle-wallet-model");
if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);
  for (let i = 0; i < cpu; i++) {
    cluster.fork();
  }
  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {

  if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
  }
  const port = process.env.PORT || 3300;

  const app = express();

  app.set("view engine", "ejs");

  // import all error controllers here
  const corsError = require("./middleware/error-handlers/cors-err");
  const centralError = require("./middleware/error-handlers/err");

  // all routes here
  const authRoutes = require("./routes/auth-routes");
  const userRoutes = require("./routes/user-routes");
  const adminRoutes = require("./routes/admin-routes");
  const driverRoutes = require("./routes/driver-routes");
  const paymentRoutes = require("./routes/payment-routes");
  const trackingRoutes = require("./routes/tracking-routes");
  const walletRoutes = require("./routes/wallet-routes");

  //multer file storage
  const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "images");
    },
    filename: (req, file, cb) => {
      cb(
        null,
        new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
      );
    },
  });

  //multer file filter
  const fileFilter = (req, file, cb) => {
    if (
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(express.static(__dirname));
  app.use(express.static(path.join(__dirname, "public")));

  // multer configuration
  app.use(
    multer({
      storage: fileStorage,
      fileFilter: fileFilter,
    }).single("image")
  );

  app.use("/images", express.static(path.join(__dirname, "images")));

  //handling the cors error here
  app.use(corsError.corsErr);

  app.use("/auth", authRoutes);
  app.use("/user", userRoutes);
  app.use("/driver", driverRoutes);
  app.use("/admin", adminRoutes);
  app.use("/track", trackingRoutes);
  app.use("/payment", paymentRoutes);
  app.use("/wallet", walletRoutes);

  app.use(helmet());
  app.use(compression());

  //central error handling middleware
  app.use(centralError.getError);

  // sync with database
  sequelize
    .sync()
    .then(() => {
      app.listen(port);
    })
    .catch((err) => {
      console.log(err);
    });
}
