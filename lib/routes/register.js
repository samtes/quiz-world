var express = require("express");
var router = express.Router();
var User = require("../models/user.js");
var tools = require("../utilities/validate");
var error = require("../utilities/error");

router.post("/", function (req, res, next) {
  if (!req.body || !req.body.email || !req.body.password || !req.body.confirmPassword) {
    var err = error.badRequest("Invalid request");
    return next(err);
  }

  var isPasswordMatching = tools.passwordMatch(req.body.password, req.body.confirmPassword);
  var isValidEmail = tools.validateEmail(req.body.email);


  if (!isValidEmail) {
    var err = error.badRequest("Invalid email");
    return next(err);
  }

  if (!isPasswordMatching) {
    var err = error.badRequest("Password mismatch");
    return next(err);
  }

  if (isPasswordMatching && isValidEmail) {
    var user = new User(req.body);

    user.register(function (err, data) {
      if (err) {
        return next(err);
      }

      req.session.regenerate(function(err) {
        req.session.uid = user._id.toString();
        req.session.isAuthenticated = true;
        req.session.save(function () {
          res.send(201, {
            token: req.sessionID,
            userID: user._id.toString()
          });
        });
      });
    });
  }
});

module.exports = router;
