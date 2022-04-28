const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");

// ensureAuthenticated makes sure user is logged in when viewing

router.get("/", forwardAuthenticated, (req, res) => res.render("welcome"));

router.get("/dashboard", ensureAuthenticated, (req, res) => {
  res.render("dashboard", {
    user: req.user,
  });
});

router.get("/fondos", ensureAuthenticated, (req, res) =>
  res.render("fondos", {
    user: req.user,
  })
);

router.get("/1", ensureAuthenticated, (req, res) =>
  res.render("1", {
    user: req.user,
  })
);

router.get("/user", ensureAuthenticated, (req, res) =>
  res.render("user", {
    user: req.user,
  })
);

module.exports = router;
