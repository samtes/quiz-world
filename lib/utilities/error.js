module.exports = {
  notFound: function (message) {
    var err = new Error(message);
    err.status = 404;
    return err;
  },
  notCreated: function (message) {
    var err = new Error(message);
    err.status = 422;
    return err;
  },
  badRequest: function (message) {
    var error = {
      status: 400,
      error: {
        message: message
      }
    }
    return error;
  },
  unauthorized: function (message) {
    var err = new Error(message);
    err.status = 401;
    return err;
  },
  serverError: function (message) {
    var err = new Error(message);
    err.status = 500;
    return err;
  },
  notAllowed: function (message) {
    var err = new Error(message);
    err.status = 405;
    return err;
  }
}
