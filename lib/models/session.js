var initMongo = require("../server/init-mongo.js");
var sessions = initMongo.db.collection("sessions");
var ObjectID = require("mongoskin").ObjectID;
var _ = require("lodash");
var error = require("../utilities/error");

module.exports = Session;

function Session (opt) {
  this.quantity = Number(opt.quantity);
  this.difficulty = Number(opt.difficulty);
  this.type = opt.type;
  this.correct = [];
  this.wrong = [];
  this.questions = opt.questions;
  this.updatedAt = new Date();
  this.createdAt = new Date();
}

Session.prototype.insert = function (fn) {
  sessions.insert(this, function (err, record) {
    if (err) {
      return fn(err);
    }

    fn(null, _.extend(record[0], Session.prototype));
  });
};

Session.findAll = function (fn) {
  sessions.find().toArray(function (err, records) {
    if (err) {
      return fn(err);
    }

    fn(null, records);
  });
};

Session.findById = function (id, fn) {
  sessions.findOne({_id: new ObjectID(id)}, function (err, record) {
    if (err) {
      return fn(err);
    }

    if (record) {
      fn(null, _.extend(record, Session.prototype));
    } else {
      var err = error.notFound("Session not found.");
      fn(err);
    }
  });
}

Session.prototype.update = function (params, fn) {
  params.updatedAt = new Date();
  sessions.update({_id: this._id},  { "$set": params }, function (err, count) {
    if (err) {
      return fn(err);
    }

    fn(null, count);
  });
};

Session.removeById = function (id, fn) {
  sessions.remove({_id: new ObjectID(id)}, function (err, count) {
    if (err) {
      return fn(err);
    }

    fn(null, count);
  });
};
