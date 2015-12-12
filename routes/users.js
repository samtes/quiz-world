var express = require("express");
var router = express.Router();
var User = require("../models/user");

/* GET users listing. */
router.get("/", function(req, res, next) {
  res.send({
    data: "respond with a resource"
  });
});

router.get("/:id", function (req, res, next) {
  User.findById(req.params.id, function (err, user) {
    if (err) {
    console.log("This is the error from user model", err);
      err.status = 422;
      return next(err);
    }

    res.send({
      user: user
    });
    next();
  });
})

module.exports = router;
