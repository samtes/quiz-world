var express = require("express");
var router = express.Router();
var User = require("../models/user.js");
var tools = require("../utilities/user-credentials");
var error = require("../utilities/error");

/* GET users listing. */
router.post("/", function (req, res, next) {
  // check for valid paylod
  if (!req.body || !req.body.email || !req.body.password || !req.body.confirmPassword) {
    var err = error.badRequest("Invalid request");
    return next(err);
  }

  var isPasswordMatching = tools.passwordMatch(req.body.password, req.body.confirmPassword);
  var isValidEmail = tools.validateEmail(req.body.email);


  if (!isValidEmail) {
    console.log("Result for email format validation ===> ", isValidEmail);
    var err = error.badRequest("Invalid email");
    return next(err);
  }

  if (!isPasswordMatching) {
    console.log("Password matching result ===> ", isPasswordMatching);
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
        req.session.userId = data._id.toString();
        req.session.save(function () {
          res.send(200, {
            token: req.session.id,
            isAuthenticated: true,
            user: data._id.toString()
          });
        });
      });
    });
  }
});

module.exports = router;
