var error = require("../utilities/error");
var User = require("../models/user");

module.exports = {
  authenticate: function (req, res, next) {
    if (req.session.isAuthenticated &&
      req.headers["session-id"] === req.sessionID.toString()) {
      next();
    } else {
      req.session.destroy(function () {
        var err = error.unauthorized("User not authorized.");
        next(err);
      });
    }
  },

  isAdmin: function (req, res, next) {
    User.findById(req.session.uid, function (err, user) {
      if (err) {
        return next(err);
      }

      if (user.role === "admin") {
        next();
      } else {
        next(error.unauthorized("User not authorized."));
      }
    });
  },

  isSelf: function (req, res, next) {
    if (req.params.id !== req.session.uid) {
      return next(error.unauthorized("User not authorized."));
    }

    next();
  },

  isAdminOrOwner: function (req, res, next) {
    User.findById(req.session.uid, function (err, user) {
      if (err) {
        return next(err);
      }

      if (user.role === "admin" || req.params.id === req.session.uid) {
        next();
      } else {
        next(error.unauthorized("User not authorized."));
      }
    });
  }
}
