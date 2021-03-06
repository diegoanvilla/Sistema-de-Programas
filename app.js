const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const passport = require("passport");
const flash = require("connect-flash");
const session = require("express-session");
const findEveryUserAndAddProfits = require("./updatePlanGains");
const Plan = require("./models/Plans");
require("dotenv").config();
const app = express();

findEveryUserAndAddProfits();

// Passport Config
require("./config/passport")(passport);

// DB Config
const db = require("./config/keys").mongoURI;

// Connect to MongoDB
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));
mongoose.set("useFindAndModify", false);
// EJS
app.use(expressLayouts);
app.set("view engine", "ejs");

// Express body parser
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

// Routes
app.use("/", require("./routes/index.js"));
app.use("/", require("./routes/users.js"));
app.use("/", require("./routes/transaction"));
app.use("/css", express.static("css"));
app.use("/fonts", express.static("fonts"));
app.use("/js", express.static("js"));
app.use("/particles", express.static("particles"));
app.use("/core", express.static("core"));
app.use("/plugins", express.static("plugins"));
app.use("/img", express.static("img"));

const whenStartServer = async () => {
  const priceSP = await Plan.findOne({ plan: "1" });
  const priceModerado = await Plan.findOne({ plan: "2" });
  const priceBTC = await Plan.findOne({ plan: "3" });
  process.env.SP = priceSP.historialDia[23];
  process.env.BTC = priceBTC.historialDia[23];
  process.env.CD = `${priceSP.porcentajeDia}`;
  process.env.MD = `${priceModerado.porcentajeDia}`;
  process.env.AD = `${priceBTC.porcentajeDia} `;

  const PORT = process.env.PORT || 80;

  app.listen(PORT, console.log(`Server started on port ${PORT}`));
};
whenStartServer();
