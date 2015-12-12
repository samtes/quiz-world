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

  if (tools.passwordMatch(req.body.password, req.body.confirmPassword) && tools.validateEmail(req.body.email)) {
    var user = new User(req.body);

    user.register(function (err, data) {
      if (err) {
        err.status = 422;
        return next(err);
      }

      res.send(200);
      next();
    });
  }
});

module.exports = router;
