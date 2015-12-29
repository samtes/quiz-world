var express = require("express");
var router = express.Router();
var User = require("../models/user");
var Session = require("../models/session");
var tools = require("../utilities/validate");
var error = require("../utilities/error");

router.post("/", function (req, res, next) {
  if (!req.body || !req.body.email || !req.body.password || !req.body.confirmPassword) {
    var err = error.badRequest("Invalid request.");
    return next(err);
  }

  var isValidEmail = tools.validateEmail(req.body.email);
  var isPasswordMatching = tools.passwordMatch(req.body.password, req.body.confirmPassword);
  var isPasswordValid = tools.verifyPassword(req.body.password);

  if (!isValidEmail) {
    var err = error.badRequest("Invalid email.");
    return next(err);
  }

  if (!isPasswordMatching) {
    var err = error.badRequest("Password mismatch.");
    return next(err);
  }

  if (!isPasswordValid) {
    var err = error.badRequest("Invalid password.");
    return next(err);
  }

  Session.findById(req.query["session-id"], function (err, session) {
    if (err) {
      return next(err);
    }

    new User(req.body).register(function (err, user) {
      if (err) {
        return next(err);
      }

      session.update({userId: user._id.toString()}, function (err, sess) {
        if (err) {
          return next(err);
        }

        req.session.regenerate(function(err) {
          req.session.uid = user._id.toString();
          req.session.isAuthenticated = true;
          req.session.save(function () {
            res.status(201).send({
              token: req.sessionID,
              userID: user._id.toString()
            });
          });
        });
      });
    });
  });
});

module.exports = router;
