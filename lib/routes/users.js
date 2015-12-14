var express = require("express");
var router = express.Router();
var User = require("../models/user");
var tools = require("../utilities/user-credentials");
var error = require("../utilities/error");

/* GET users listing. */
router.get("/", function (req, res, next) {
  User.findAll(function (err, users) {
    if (err) {
      return next (err);
    }

    res.send({
      users: users
    });
  });
});

router.get("/:id", function (req, res, next) {
  User.findById(req.params.id, function (err, user) {
    if (err) {
      err.status = 422;
      return next(err);
    }

    res.send({
      user: user
    });
  });
});

router.put("/:id", function (req, res, next) {
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
        if (!(req.body.email && tools.validateEmail(req.body.email))) {
          var err = error.badRequest("Invalid email.");
          return next(err);
        }

        User.findByEmail(req.body.email, function (err, record) {
          if (err) {
            return next(err);
          }

          if (record) {
            var err = error.notCreated("Email already taken.");
            return next(err);
          } else {
            user.update(req.body, function (err, count) {
              console.log(err, count)
              if (err) {
                return next(err);
              }

              if (count) {
               res.send(201, {
                  message: "Record successfully updated"
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
           res.send(201, {
              message: "Record successfully updated"
           }); 
          }
        });
      }
    }
  });
});

module.exports = router;
