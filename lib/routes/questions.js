var express = require("express");
var router = express.Router();
var Question = require("../models/question");
var tools = require("../utilities/validate");
var error = require("../utilities/error");
var requireLogin = require("../server/authentication").authenticate;
var onlyAdmin = require("../server/authentication").isAdmin;
var onlyUser = require("../server/authentication").isSelf;
var onlyOwnerOrAdmin = require("../server/authentication").isAdminOrOwner;

router.get("/:id", [
  requireLogin,
  onlyAdmin,
  function (req, res, next) {
    Question.findById(req.params.id, function (err, question) {
      if (err) {
        return next(err);
      }

      res.status(200).send({
        question: question
      });
    });
  }
]);

router.post("/", [
  requireLogin,
  onlyAdmin,
  function (req, res, next) {
    if (!req.body || !req.body.question ||
      !req.body.options || !req.body.difficulty || !req.body.type) {
      return next(error.badRequest("Invalid request."));
    }

    var correct = req.body.options.filter(function (item) {
      return item.correct;
    });

    if (!correct.length) {
      return next(error.badRequest("Invalid request."));
    }

    var question = new Question(req.body);

    question.insert(function (err, question) {
      if (err) {
        return next(err);
      }

      res.status(201).send({
        message: "Question successfully added."
      });
    });
  }
]);

router.put("/:id", [
  requireLogin,
  onlyAdmin,
  function (req, res, next) {
    if (!req.body || !req.body.question &&
      !req.body.options && !req.body.difficulty && !req.body.type) {
      return next(error.badRequest("Invalid request."));
    }

    Question.findById(req.params.id, function (err, question) {
      question.update(req.body, function (err, count) {
        if (count) {
          res.status(201).send({
            message: "Question successfully updated."
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
    Question.removeById(req.params.id, function (err, count) {
      if (err) {
        return next(err);
      }

      if (!count) {
        return next(error.notCreated("Request not processed."));
      }

      res.status(201).send({
        message: "Question successfully deleted."
      });
    });
  }
])

module.exports = router;
