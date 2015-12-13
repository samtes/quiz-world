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
    var err = new Error(message);
    err.status = 400;
    return err;
  },
}
