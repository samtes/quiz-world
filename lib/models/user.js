var initMongo = require("../server/init-mongo.js");
var users = initMongo.db.collection("users");
var ObjectID = require("mongoskin").ObjectID;
var _ = require("lodash");
var error = require("../utilities/error");
var bcrypt = require("bcrypt");

module.exports = User;

function User (opt) {
  this.email = opt.email;
  this.password = opt.password;
  this.updatedAt = new Date();
  this.createdAt = new Date();
}

User.findByEmailAndPassword = function (params, fn) {
  users.findOne({ email : params.email }, function (err, user) {
    if (err) {
      return fn(err);
    }

    if (user) {
      bcrypt.compare(params.password, user.password, function (err, result) {
        if (err) {
          return fn(err);
        }

        if (result) {
          fn(null, user);
        } else {
          var err = error.notFound("User not found");
          fn(err);
        }
      });
    } else {
      var err = error.notFound("User not found");
      fn(err);
    }
  });
};

User.findAll = function (fn) {
  users.find().toArray(function (err, records) {
    if (err) {
      return fn(err);
    }

    fn(null, records);
  });
}

User.findByEmail = function (email, fn) {
  users.findOne({ email: email }, function (err, record) {
    if (err) {
      return fn(err);
    }

    if (record) {
      fn (null, _.extend(record, User.prototype));
    } else {
      fn(null, null);
    }
  });
}

User.findById = function (id, fn) {
  users.findOne({_id: new ObjectID(id)}, function (err, record) {
    if (err) {
      return fn(err);
    }

    if (record) {
      fn(null, _.extend(record, User.prototype));
    } else {
      var err = error.notFound("User not found");
      fn(err);
    }
  });
}

User.prototype.register = function (fn) {
  var self = this;

  users.findOne({ email: self.email }, function (err, user) {
    if (user) {
      var err = error.notCreated("User already exists.");
      fn(err);
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

User.prototype.update = function (params, fn) {
  console.log("GETTING HERE ", params)
  var self = this;
  params.updatedAt = new Date();
  if (params.password) {
    hashPassword(params.password, function (err, hashPassword) {
      if (err){
        return fn(err);
      }

      params.password = hashPassword;

      users.update({_id: self._id},  { "$set": params }, function (err, count) {
        if (err) {
          return fn(err);
        }

        if (count === 0) {
          var err = error.notCreated("No record updated.");
          return fn(err);
        } else {
          fn(null, count);
        }
      });
    });
  } else {
    users.update({_id: self._id}, { "$set": params }, function (err, count) {
      if (err) {
        return fn(err);
      }

      if (count === 0) {
        var err = error.notCreated("No record updated.");
        return fn(err);
      } else {
        fn(null, count);
      }
    });
  }
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
          var err = error.notCreated("Record not inserted.")
          fn(err);
        }
      });
    } else {
      var err = error.notCreated("User already exists.");
      fn(err);
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
