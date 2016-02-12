var express = require("express");
var router = express.Router();
var User = require("../models/user");
var Session = require("../models/session");
var tools = require("../utilities/validate");
var error = require("../utilities/error");
var requireLogin = require("../server/authentication").authenticate;
var onlyAdmin = require("../server/authentication").isAdmin;
var onlyUser = require("../server/authentication").isSelf;
var onlyOwnerOrAdmin = require("../server/authentication").isAdminOrOwner;

router.post("/", function (req, res, next) {
  console.log("User request ==> ", req.body);
  if (!req.body.user || !req.body.user.email || !req.body.user.password || !req.body.user.confirmPassword) {
    var err = error.badRequest("Invalid request.");
    return next(err);
  }
  req.body = req.body.user;
  var isValidEmail = tools.validateEmail(req.body.email);
  var isPasswordMatching = tools.passwordMatch(req.body.password, req.body.confirmPassword);
  var isPasswordValid = tools.verifyPassword(req.body.password);
  var isMongoId = tools.verifyMongoId(req.body.key);

  if (!isValidEmail) {
    return next(error.badRequest("Invalid email."));
  }

  if (!isPasswordMatching) {
    return next(error.badRequest("Password mismatch."));
  }

  if (!isPasswordValid) {
    return next(error.badRequest("Invalid password."));
  }

  if (!isMongoId) {
    return next(error.badRequest("Invalid Session."));
  }

  Session.findById(req.body.key, function (err, session) {
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
            res.set("Session-id",req.sessionID);
            res.status(201).send({
              token: req.sessionID,
              userID: user._id.toString(),
              key: session._id.toString()
            });
          });
        });
      });
    });
  });
});

router.get("/", [
  // requireLogin,
  // onlyAdmin,
  function (req, res, next) {
    User.findAll(function (err, users) {
      if (err) {
        return next (err);
      }

      res.status(200).json({
        users: users
      });
    });
  }
]);

router.get("/:id", [
  // requireLogin,
  // onlyUser,
  function (req, res, next) {
    User.findById(req.params.id, function (err, user) {
      if (err) {
        return next(err);
      }

      res.status(200).json({
        user: user
      });
    });
  }
]);

router.put("/:id", [
  requireLogin,
  onlyOwnerOrAdmin,
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

router.delete("/", [
  requireLogin,
  onlyAdmin,
  function (req, res, next) {
    if (!req.body || !req.body.email) {
      return next(error.badRequest("Invalid request."));
    }

    User.findByEmail(req.body.email, function (err, user) {
      if (err) {
        return next(err);
      }

      if (!user) {
        return next(error.notFound("User not found."));
      }

      user.remove(function (err, count) {
        if (err) {
          return next(err);
        }

        res.status(201).send({
          message: "User successfully deleted."
        });
      });
    });
  }
])

module.exports = router;
