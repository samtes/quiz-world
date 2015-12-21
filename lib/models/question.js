var initMongo = require("../server/init-mongo.js");
var questions = initMongo.db.collection("questions");
var ObjectID = require("mongoskin").ObjectID;
var _ = require("lodash");
var error = require("../utilities/error");

module.exports = Question;

function Question (opt) {
  this.question = opt.question;
  this.options = opt.options;
  this.difficulty = opt.difficulty;
  this.type = opt.type;
  this.updatedAt = new Date();
  this.createdAt = new Date();
}

Question.prototype.insert = function (fn) {
  questions.insert(this, function (err, record) {
    if (err) {
      return fn(err);
    }

    fn(null, record[0]);
  });
};

Question.findById = function (id, fn) {
  questions.findOne({_id: new ObjectID(id)}, function (err, record) {
    if (err) {
      return fn(err);
    }

    if (record) {
      fn(null, _.extend(record, Question.prototype));
    } else {
      var err = error.notFound("Question not found.");
      fn(err);
    }
  });
}

Question.bulkInsert = function (quests, fn) {
  questions.insert(quests, function (err, records) {
    if (err) {
      return fn(err);
    }

    fn(null, records);
  });
}

Question.getCustomQuestions = function (options, limit, fn) {
  questions.find(options).limit(limit).toArray(function (err, records) {
    if (err) {
      return fn(err);
    }

    fn(null, records);
  });
}

Question.prototype.update = function (params, fn) {
  params.updatedAt = new Date();
  questions.update({_id: this._id},  { "$set": params }, function (err, count) {
    if (err) {
      return fn(err);
    }

    fn(null, count);
  });
};

Question.removeById = function (id, fn) {
  questions.remove({_id: new ObjectID(id)}, function (err, count) {
    if (err) {
      return fn(err);
    }

    fn(null, count);
  });
};
