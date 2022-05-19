const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const url = require("url");
const User = require("../models/User");
const { forwardAuthenticated } = require("../config/auth");

// Login Page
router.get("/login", forwardAuthenticated, (req, res) => res.render("login"));

// Register Page
router.get("/register", forwardAuthenticated, (req, res) => {
  res.render("register");
});

// Register
router.post("/register", async (req, res) => {
  const { name, email, wallet, password, password2, group } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Por favor introduce todos los campos" });
  }

  if (password != password2) {
    errors.push({ msg: "Contraseñas no coinciden" });
  }

  if (password.length < 6) {
    errors.push({ msg: "Contraseña debe tener al menos 6 letras o numeros" });
  }

  if (password.length > 16) {
    errors.push({ msg: "Contraseña es muy larga" });
  }
  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      password,
      password2,
    });
  } else {
    User.findOne({ name: name }).then((user) => {
      if (user) {
        errors.push({ msg: "Usuario ya existe" });
        res.render("register", {
          errors,
          name,
          email,
          password,
          password2,
        });
      } else {
        const newUser = new User({
          name,
          wallet,
          email,
          password,
          balance: 0.0,
          renta: 0.0,
          plan: [
            {
              name: "",
              number: "",
            },
          ],
        });
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then((user) => {
                user.linkReferido = `http://localhost:80/register?referred=${user._id}`;
                user.save().then(async () => {
                  req.flash(
                    "success_msg",
                    "Ya estas registrado, puedes ingresar"
                  );
                });
                res.redirect("/login");
              })
              .catch((err) => console.log(err));
          });
        });
      }
    });
  }
});

// Login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: true,
  })(req, res, next);
});

// Logout
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "Haz cerrado sesion");
  res.redirect("/login");
});

module.exports = router;
