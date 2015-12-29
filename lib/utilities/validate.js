module.exports = {
  passwordMatch: function (password, confirmationPassword) {
    if (password && confirmationPassword && password === confirmationPassword) {
      return true;
    }
    return false;
  },

  validateEmail: function (email) {
    var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  },

  verifyPassword: function (password) {
    if (password.length < 6 || password.search(/[a-z]/) < 0 ||
     password.search(/[A-Z]/) < 0 || password.search(/[0-9]/) < 0) {
      return false;
    }
    return true;
  },

  verifyMongoId: function (id) {
    var mongoId = new RegExp("^[0-9a-fA-F]{24}$");

    return mongoId.test(id);
  }
}
