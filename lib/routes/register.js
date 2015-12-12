var express = require("express");
var router = express.Router();
var User = require("../models/user.js");
var tools = require("../utilities/user-credentials");
/* GET users listing. */
router.post("/", function (req, res, next) {
  // check for valid paylod
  if (!req.body || !req.body.email || !req.body.password || !req.body.confirmPassword) {
    var err = new Error("Invalid paylod");
    err.status = 400;
    return next(err);
  }

  var isPasswordMatching = tools.passwordMatch(req.body.password, req.body.confirmPassword);
  var isValidEmail = tools.validateEmail(req.body.email);


  if (!isValidEmail) {
    console.log("Result for email format validation ===> ", isValidEmail);
    var err = new Error("Invalid email");
    err.status = 400;

    return next(err);
  }

  if (!isPasswordMatching) {
    console.log("Password matching result ===> ", isPasswordMatching);
    var err = new Error("Password mismatch");
    err.status = 400;

    return next(err);
  }

  if (isPasswordMatching && isValidEmail) {
    var user = new User(req.body);

    user.register(function (err, data) {
      if (err) {
        err.status = 422;
        return next(err);
      }

      res.send(201, {
        message: "User successfully registered"
      });
    });
  }
});

module.exports = router;
