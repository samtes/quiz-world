var express = require("express");
var router = express.Router();
var Question = require("../models/question");
var Session = require("../models/session");
var tools = require("../utilities/validate");
var error = require("../utilities/error");
var requireLogin = require("../server/authentication").authenticate;
var onlyAdmin = require("../server/authentication").isAdmin;
var onlyUser = require("../server/authentication").isSelf;
var onlyOwnerOrAdmin = require("../server/authentication").isAdminOrOwner;
var _ = require("lodash");

router.get("/", [
  // requireLogin,
  // onlyAdmin,
  function (req, res, next) {
    Session.findAll(function (err, sessions) {
      if (err) {
        return next(err);
      }

      res.status(200).json({
        keys: sessions
      });
    });
  }
]);

router.get("/:id", [
  // requireLogin,
  // onlyAdmin,
  function (req, res, next) {
    console.log()
    console.log("getting herer ===> session ===> ", req.body)
    console.log()
    Session.findById(req.params.id, function (err, session) {
      if (err) {
        return next(err);
      }

      res.status(200).json({
        key: session
      });
    });
  }
]);

router.post("/", [
  // requireLogin,
  // onlyAdmin,
  function (req, res, next) {
    var limit, difficulty;

    if (req.body.key.content === "random") {
      if (!req.body.key || !req.body.key.quantity) {
        return next(error.badRequest("Invalid request."));
      }

      limit = Number(req.body.key.quantity);

      if (!limit) {
        return next(error.badRequest("Invalid quantity. Numeric value required."));
      }
    } else {
      if (!req.body.key || !req.body.key.difficulty || !req.body.key.quantity || !req.body.key.type) {
        return next(error.badRequest("Invalid request."));
      }

      limit = Number(req.body.key.quantity);
      difficulty = Number(req.body.key.difficulty);

      if (!limit) {
        return next(error.badRequest("Invalid quantity. Numeric value required."));
      }

      if (!difficulty) {
        return next(error.badRequest("Invalid difficulty. Numeric value greater than 0 required."));
      }

      if (difficulty > 3) {
        return next(error.badRequest("Invalid quantity. Quantity must be between 1 - 3 (low to high)."))
      }
    }

    Question.total(function (err, total) {
      if (err) {
        return next(err);
      }

      if (limit > total) {
        return next(error.notCreated("Not enough questions in database."));
      }

      var options = generateQuery(req.body.key);

      Question.getCustomQuestions(options, limit, function (err, questions) {
        if (err) {
          return next(err);
        }

        questions.forEach(function (item) {
          item.id = item._id;
          delete item._id;
        });

        req.body.key.questions = questions;

        new Session(req.body.key).insert(function (err, session) {
          if (err) {
            return newxt(err);
          }

          res.status(201).json({
            key: {
              _id: session._id.toString(),
              content: session._id.toString()
            }
          });
        });
      });
    });
  }
]);

router.put("/:id", [
  // requireLogin,
  function (req, res, next) {
    console.log("Are we getting here ===> ", req.body);
    req.body.key.answer = req.body.key.answer || "Timed out.";

    if (!req.body.key || !req.body.key.questionId) {
      return next(error.badRequest("Invalid request."))
    }


    Session.findById(req.params.id, function (err, session) {
      if (err) {
        return next(err);
      }

      Question.findById(req.body.key.questionId, function (err, question) {
        if (err) {
          return next(err);
        }

        if (isAnswerCorrect(req.body.key.answer, question.options)) {
          console.log("===== getting to the correct block =====");
          session.correct.push(req.body.key.questionId);
          session.update({ correct: session.correct }, function (err, count) {
            if (err) {
              return next(err);
            }

            res.status(201).send({
              message: "Session successfully updated."
            });
          });
        } else {
          console.log("===== getting to the wrong block =====");

          session.wrong.push({ question: req.body.key.questionId, choice: req.body.key.answer });
          session.update({ wrong: session.wrong }, function (err, count) {
            if (err) {
              return next(err);
            }

            res.status(201).send({
              message: "Session successfully updated."
            });
          });
        }
      });
    });
  }
]);

router.delete("/:id", [
  requireLogin,
  onlyAdmin,
  function (req, res, next) {
    Session.removeById(req.params.id, function (err, count) {
      if (err) {
        return next(err);
      }

      if (!count) {
        return next(error.notCreated("Request not processed."));
      }

      res.status(201).send({
        message: "Session successfully deleted."
      });
    });
  }
]);

function isAnswerCorrect (answer, options) {
  var result = false;

  options.forEach(function (option) {
    if (answer === option.option && option.correct === true) {
      result = true;
    }
  });

  return result;
}

function generateQuery (params) {
  if (params.content === "random") {
    return {};
  }

  var options = {
    difficulty: params.difficulty
  };

  if (params.type.length === 1) {
    options.type = params.type[0];
  } else {
    options["$or"] = _.map(params.type, function (item) {
      return { type: item };
    });
  }

  return options;
}

module.exports = router;
