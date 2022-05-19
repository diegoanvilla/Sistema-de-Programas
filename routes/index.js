const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");
const getUserPlan = require("../getUserPlan.js");
// ensureAuthenticated makes sure user is logged in when viewing

router.get("/", forwardAuthenticated, (req, res) => res.render("welcome"));

router.get("/dashboard", ensureAuthenticated, (req, res) => {
  const planData = getUserPlan(req.user.plan.number);
  res.render("dashboard", {
    user: req.user,
    plan: planData,
  });
});

router.get("/fondos", ensureAuthenticated, (req, res) => {
  const planData = getUserPlan(req.user.plan.number);
  res.render("fondos", {
    user: req.user,
    plan: planData,
  });
});

router.get("/user", ensureAuthenticated, (req, res) => {
  const planData = getUserPlan(req.user.plan.number);
  res.render("user", {
    user: req.user,
    plan: planData,
  });
});
router.get("/planPorcentaje", (req, res) => {
  res.send([process.env.CD, process.env.MD, process.env.AD]);
});

module.exports = router;
