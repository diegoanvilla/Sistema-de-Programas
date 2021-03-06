module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated() && process.env.ON == 1) {
      return next();
    }
    req.flash("error_msg", "Ingresa para ver");
    res.redirect("/login");
  },
  forwardAuthenticated: function (req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect("/dashboard");
  },
};
