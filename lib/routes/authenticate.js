var express = require("express");
var router = express.Router();
var User = require("../models/user.js");
var tools = require("../utilities/validate");

router.post("/", function (req, res, next) {
  if (!req.body || !req.body.email || !req.body.password || !req.body.session) {
    return next(error.badRequest("Invalid request."));
  }

  var isValidEmail = tools.validateEmail(req.body.email);

  if (!isValidEmail) {
    return next(error.badRequest("Invalid request."));
  }

  User.findByEmailAndPassword(req.body,function (err, user) {
    if (err) {
      return next(err);
    }

    req.session.regenerate(function(err) {
      req.session.uid = user._id.toString();
      req.session.isAuthenticated = true;
      req.session.save(function () {
        res.send(200, {
          token: req.sessionID,
          userID: user._id.toString()
        });
      });
    });
  });
});

router.delete("/", function (req, res, next) {
  req.session.destroy(function () {
    res.send(200);
  });
});

module.exports = router;
