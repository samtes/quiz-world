var initMongo = require("../server/init-mongo.js");
var users = initMongo.db.collection("users");
var ObjectID = require("mongoskin").ObjectID;
var _ = require("lodash");
var bcrypt = require("bcrypt");

module.exports = User;

function User (opt) {
  this.email = opt.email;
  this.password = opt.password;
  this.updatedAt = new Date();
  this.createdAt = new Date();
}

User.findById = function (id, fn) {
  users.findOne({_id: new ObjectID(id)}, function (err, record) {
    if (err) {
      return fn(err);
    }

    if (record) {
      fn (null, _.extend(record, User.prototype));
    }
  });
}

User.prototype.register = function (fn) {
  var self = this;

  users.findOne({ email: self.email }, function (err, user) {
    if (user) {
      fn(new Error("User already exists."));
    } else {
      hashPassword(self.password, function (err, hashedPwd) {
        if (err) {
          return fn(err);
        }

        self.password = hashedPwd;
        insert(self, function (err, record) {
          if (err) {
            return fn(err);
          }

          fn(null, record[0]);
        });
      });
    }
  });
};

function insert (user, fn) {
  users.find({email: user.email}, function (err, record) {
    if (err) {
      return fn(err);
    }

    if (!record.length) {
      users.insert(user, function (err, record) {
        if (err) {
          return fn(err);
        }

        if (record.length) {
          fn(null, record);
        } else {
          fn(new Error("Record not inserted."));
        }
      });
    } else {
      fn(new Error("User already exists"));
    }
  });
}

function hashPassword (password, fn) {
  bcrypt.hash(password, 8, function (err, hash) {
    if (err) {
      return fn(err);
    }

    fn(null, hash);
  });
}
