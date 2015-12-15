var error = require("../utilities/error");

module.exports = {
  authenticate: function (req, res, next) {
    if (req.session.isAuthenticated && req.headers["session-id"] === req.session.id) {
      next();
    } else {
      req.session.destroy(function () {
        var err = error.unauthorized("User is not authorized");
        next(err);
      });
    }
  }
}
