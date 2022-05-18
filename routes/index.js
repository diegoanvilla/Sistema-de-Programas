const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");
// ensureAuthenticated makes sure user is logged in when viewing

router.get("/", forwardAuthenticated, (req, res) => res.render("welcome"));

router.get("/dashboard", ensureAuthenticated, (req, res) => {
  const enviromentPlans = [
    { planDiario: process.env.CD, comodidad: process.env.SP },
    {
      planDiario: process.env.MD,
      comodidad: (parseFloat(process.env.SP) * parseFloat(process.env.BTC)) / 2,
    },
    { planDiario: process.env.AD, comodidad: process.env.BTC },
  ];
  const planData = enviromentPlans[req.user.plan.number - 1];
  res.render("dashboard", {
    user: req.user,
    plan: planData,
  });
});

router.get("/fondos", ensureAuthenticated, (req, res) => {
  const enviromentPlans = [
    { planDiario: process.env.CD, comodidad: process.env.SP },
    {
      planDiario: process.env.MD,
      comodidad: (parseFloat(process.env.SP) * parseFloat(process.env.BTC)) / 2,
    },
    { planDiario: process.env.AD, comodidad: process.env.BTC },
  ];
  const planData = enviromentPlans[req.user.plan.number - 1];
  res.render("fondos", {
    user: req.user,
    plan: planData,
  });
});

router.get("/1", ensureAuthenticated, (req, res) =>
  res.render("1", {
    user: req.user,
  })
);

router.get("/user", ensureAuthenticated, (req, res) => {
  const enviromentPlans = [
    { planDiario: process.env.CD, comodidad: process.env.SP },
    {
      planDiario: process.env.MD,
      comodidad: (parseFloat(process.env.SP) * parseFloat(process.env.BTC)) / 2,
    },
    { planDiario: process.env.AD, comodidad: process.env.BTC },
  ];
  const planData = enviromentPlans[req.user.plan.number - 1];
  res.render("user", {
    user: req.user,
    plan: planData,
  });
});
router.get("/planPorcentaje", (req, res) => {
  res.send([process.env.CD, process.env.MD, process.env.AD]);
});

module.exports = router;
