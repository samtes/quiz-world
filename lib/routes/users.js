var express = require("express");
var router = express.Router();
var User = require("../models/user");
var tools = require("../utilities/validate");
var error = require("../utilities/error");
var requireLogin = require("../server/authentication").authenticate;

router.get("/", [
  requireLogin,
  function (req, res, next) {
    User.findAll(function (err, users) {
      if (err) {
        return next (err);
      }

      res.status(200).send({
        users: users
      });
    });
  }
]);

router.get("/:id", [
  requireLogin,
  function (req, res, next) {
    User.findById(req.params.id, function (err, user) {
      if (err) {
        return next(err);
      }

      res.status(200).send({
        user: user
      });
    });
  }
]);

router.put("/:id", [
  requireLogin,
  function (req, res, next) {
    if (!req.body.email && !req.body.password) {
      var err = error.badRequest("Invalid request.");
      return next(err);
    }

    User.findById(req.params.id, function (err, user) {
      if (err) {
        return next(err);
      }
      if (user) {

        if (req.body.email) {
          var isEmailValid = tools.validateEmail(req.body.email);

          if (!isEmailValid) {
            return next(error.badRequest("Invalid email."));
          }
        }

        if (req.body.password) {
          var isPasswordValid = tools.verifyPassword(req.body.password);

          if (!isPasswordValid) {
            return next(error.badRequest("Invalid password."));
          }
        }

        if (req.body.email) {
          User.findByEmail(req.body.email, function (err, record) {
            if (err) {
              return next(err);
            }

            if (record) {
              var err = error.notCreated("Email already taken.");
              return next(err);
            } else {
              user.update(req.body, function (err, count) {
                if (err) {
                  return next(err);
                }

                if (count) {
                 res.status(201).send({
                    message: "User successfully updated."
                 });
                }
              });
            }
          });
        } else {
          user.update(req.body, function (err, count) {
            if (err) {
              return next(err);
            }

            if (count) {
             res.status(201).send({
                message: "Record successfully updated"
             });
            }
          });
        }
      }
    });
  }
]);

module.exports = router;
