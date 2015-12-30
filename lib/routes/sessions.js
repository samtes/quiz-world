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
  requireLogin,
  onlyAdmin,
  function (req, res, next) {
    Session.findAll(function (err, sessions) {
      if (err) {
        return next(err);
      }

      res.status(200).send({
        sessions: sessions
      });
    });
  }
]);

router.get("/:id", [
  requireLogin,
  onlyAdmin,
  function (req, res, next) {
    Session.findById(req.params.id, function (err, session) {
      if (err) {
        return next(err);
      }

      res.status(200).send({
        session: session
      });
    });
  }
]);

router.post("/", [
  requireLogin,
  onlyAdmin,
  function (req, res, next) {
    if (!req.body || !req.body.difficulty || !req.body.quantity || !req.body.type) {
      return next(error.badRequest("Invalid request."));
    }

    var limit = Number(req.body.quantity);

    Question.total(function (err, total) {
      if (err) {
        return next(err);
      }

      if (limit > total) {
        return next(error.notCreated("Not enough questions in database."));
      }

      var options = generateQuery(req.body);

      Question.getCustomQuestions(options, limit, function (err, questions) {
        if (err) {
          return next(err);
        }

        req.body.questions = _.map(questions, function (item) {
          return item._id.toString();
        });

        new Session(req.body).insert(function (err, session) {
          if (err) {
            return newxt(err);
          }

          res.status(201).send({
            session: session._id.toString()
          });
        });
      });
    });
  }
]);

router.put("/:id", [
  requireLogin,
  function (req, res, next) {
    req.body.answer = req.body.answer || "Timed out.";

    if (!req.body || !req.body.questionId) {
      return next(error.badRequest("Invalid request."))
    }


    Session.findById(req.params.id, function (err, session) {
      if (err) {
        return next(err);
      }

      Question.findById(req.body.questionId, function (err, question) {
        if (err) {
          return next(err);
        }

        if (isAnswerCorrect(req.body.answer, question.options)) {
          session.correct.push(req.body.questionId);
          session.update({ correct: session.correct }, function (err, count) {
            if (err) {
              return next(err);
            }

            res.status(201).send({
              message: "Session successfully updated."
            });
          });
        } else {
          session.wrong.push({ question: req.body.questionId, choice: req.body.answer });
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

      res.status(201).send({
        message: "Session successfully deleted."
      });
    });
  }
]);

function isAnswerCorrect (answer, options) {
  return options.filter(function (option) {
    if (answer === option.option && option.correct) {
      return option.correct;
    }
  });
}

function generateQuery (params) {
  var options = {
    difficulty: Number(params.difficulty)
  };

  if (typeof params.type === "string") {
    options.type = params.type;
  } else {
    options["$or"] = _.map(params.type, function (item) {
      return { type: item };
    });
  }

  return options;
}

module.exports = router;
