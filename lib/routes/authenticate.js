var express = require("express");
var router = express.Router();
var User = require("../models/user");
var Session = require("../models/session");
var tools = require("../utilities/validate");
var error = require("../utilities/error");

router.post("/", function (req, res, next) {
  if (!req.body || !req.body.username || !req.body.password) {
    return next(error.badRequest("Invalid request."));
  }
  req.body.email = req.body.username;
  req.body.key = req.body.scope;

  var isValidEmail = tools.validateEmail(req.body.email);

  if (!isValidEmail) {
    return next(error.badRequest("Invalid request."));
  }

  User.findByEmailAndPassword(req.body,function (err, user) {
    if (err) {
      return next(err);
    }

    if (user.role !== "admin") {
      if (!req.body.key) {
        return next(error.badRequest("Session is required."));
      }

      if (!tools.verifyMongoId(req.body.key)) {
        return next(error.badRequest("Invalid session."));
      }

      Session.findById(req.body.key, function (err, session) {
        if (err) {
          return next(err);
        }

        if (session.userId === user._id.toString()) {
          req.session.regenerate(function (err) {
            req.session.uid = user._id.toString();
            req.session.isAuthenticated = true;
            req.session.save(function () {
              res.set("Session-id",req.sessionID)
              res.status(200).send({
                token: req.sessionID,
                userID: user._id.toString()
              });
            });
          });
        } else {
          next(error.badRequest("Session not associated with user."));
        }
      });
    } else {
      req.session.regenerate(function(err) {
        req.session.uid = user._id.toString();
        req.session.isAuthenticated = true;
        req.session.save(function () {
          res.set("Session-id",req.sessionID)
          res.status(200).send({
            token: req.sessionID,
            userID: user._id.toString()
          });
        });
      });

    }
  });
});

router.delete("/", function (req, res, next) {
  req.session.destroy(function () {
    res.status(200).send();
  });
});

module.exports = router;
