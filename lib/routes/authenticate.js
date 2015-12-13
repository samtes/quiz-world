var express = require("express");
var router = express.Router();
var User = require("../models/user.js");
var tools = require("../utilities/user-credentials");
/* GET users listing. */
router.post("/", function (req, res, next) {
  if (!req.body || !req.body.email || !req.body.password || !req.body.session) {
    var err = new Error("Invalid paylod");
    err.status = 400;
    return next(err);
  }

  var isValidEmail = tools.validateEmail(req.body.email);

  if (!isValidEmail) {
    console.log("Result for email format validation ===> ", isValidEmail);
    var err = new Error("Invalid email");
    err.status = 400;

    return next(err);
  }

  User.findByEmailAndPassword(req.body,function (err, user) {
    if (err) {
      return next(err);
    }

    req.session.regenerate(function(err) {
      req.session.userId = user._id.toString();
      req.session.save(function () {
        res.send(200, {
          token: req.session.id,
          isAuthenticated: true,
          user: user._id.toString()
        });
      });
    });
  });
});

module.exports = router;
