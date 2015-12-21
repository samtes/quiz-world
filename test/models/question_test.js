process.env.DBNAME = "quiz-world-test";
var expect = require("chai").expect;
var data = require("../fixtures/questions");
var Question, initMongo;

describe("Question",  function () {
  before(function (done) {
    Question = require("../../lib/models/question");
    initMongo = require("../../lib/server/init-mongo");
    done();
  });

  afterEach(function (done) {
    initMongo.db.collection("questions").drop();
    done();
  });

  describe("new", function () {
    it("should be an instance of Question", function (done) {
      var q1 = new Question({
        question: "Which one is a CSS selector?",
        options: [{option: "Color."}, {option: "DOM elements."}, {option: "Class or id.", correct: true}, {option: "Event handler."}],
        difficulty: 1,
        type: "css"
      });

      expect(q1).to.be.an.instanceof(Question);
      done();
    });
  });

  describe("#insert", function () {
    it("Inserts a question", function (done) {
      new Question({
        question: "Which one is a CSS selector?",
        options: [{option: "Color."}, {option: "DOM elements."}, {option: "Class or id.", correct: true}, {option: "Event handler."}],
        difficulty: 1,
        type: "css"
      }).insert(function (err, question) {
        expect(question._id.toString()).to.have.length(24);
        expect(question.question).to.be.eql("Which one is a CSS selector?");
        done();
      });
    });
  });

  describe(".bulkInsert", function () {
    it("Inserts multiple questions", function (done) {
      var questions = data.bulkQuestions;

      Question.bulkInsert(questions, function (err, quests) {
        expect(quests.length).to.be.eql(14);
        done();
      });
    });
  });

  describe(".findById", function () {
    it("finds question by id", function (done) {
      new Question({
        question: "This is another CSS question?",
        options: [{option: "Color."}, {option: "DOM elements."}, {option: "Class or id.", correct: true}, {option: "Event handler."}],
        difficulty: 2,
        type: "css"
      }).insert(function (err, question) {
        Question.findById(question._id.toString(), function (err, question) {
          expect(question.question).to.be.eql("This is another CSS question?");
          expect(question.difficulty).to.be.eql(2);
          done();
        });
      });
    });

    it("returns question not found", function (done) {
      Question.findById("123412341234", function (err, question) {
        expect(err.message).to.be.eql("Question not found.");
        expect(err.status).to.be.eql(404);
        done();
      });
    });
  });

  describe(".getCustomQuestions", function () {
    it("returns 3 questions randomly", function (done) {
      var questions = data.bulkQuestions;

      Question.bulkInsert(questions, function (err, quests) {
        Question.getCustomQuestions({}, 3, function (err, quests) {
          expect(quests.length).to.be.eql(3);
          done();
        });
      });
    });

    it("returns all CSS questions randomly", function (done) {
      var questions = data.bulkQuestions;

      Question.bulkInsert(questions, function (err, quests) {
        Question.getCustomQuestions({ type: "css" }, 50, function (err, quests) {
          expect(quests.length).to.be.eql(6);
          expect(quests[0].type).to.be.eql("css");
          done();
        });
      });
    });

    it("returns 3 CSS questions randomly", function (done) {
      var questions = data.bulkQuestions;

      Question.bulkInsert(questions, function (err, quests) {
        Question.getCustomQuestions({ type: "css" }, 3, function (err, quests) {
          expect(quests.length).to.be.eql(3);
          expect(quests[0].type).to.be.eql("css");
          done();
        });
      });
    });

    it("returns HTML & CSS questions randomly", function (done) {
      var questions = data.bulkQuestions;
      Question.bulkInsert(questions, function (err, quests) {
        Question.getCustomQuestions({
          $or: [{ type: "css" }, { type: "html" }]
        }, 5, function (err, quests) {
          expect(quests.length).to.be.eql(5);
          done();
        });
      });
    });

    it("returns 4 HTML, CSS & Javascript questions randomly", function (done) {
      var questions = data.bulkQuestions;
      Question.bulkInsert(questions, function (err, quests) {
        Question.getCustomQuestions({
          $or: [{ type: "css" }, { type: "html" }, { type: "js" }]
        }, 4, function (err, quests) {
          expect(quests.length).to.be.eql(4);
          done();
        });
      });
    });

    it("returns HIGH difficult level questions randomly", function (done) {
      var questions = data.bulkQuestions;
      Question.bulkInsert(questions, function (err, quests) {
        Question.getCustomQuestions({ difficulty: 3,
          $or: [{ type: "css" }, { type: "html" }, { type: "js" }]
        }, 40, function (err, quests) {
          expect(quests.length).to.be.eql(3);
          done();
        });
      });
    });
  });

  describe("#update", function () {
    it("updates question", function (done) {
      new Question({
        question: "Which one is a CSS selector?",
        options: [{option: "Color."}, {option: "DOM elements."}, {option: "Class or id.", correct: true}, {option: "Event handler."}],
        difficulty: 1,
        type: "css"
      }).insert(function (err, question) {
        question.update({ question: "This is the new question?" }, function (err, count) {
          expect(count).to.be.eql(1);

          Question.findById(question._id.toString(), function (err, quest) {
            expect(quest.question).to.be.eql("This is the new question?");
            done();
          });
        });
      });
    });
  });

  describe(".removeById", function () {
    it("deletes question", function (done) {
      new Question({
        question: "Which one is a CSS selector?",
        options: [{option: "Color."}, {option: "DOM elements."}, {option: "Class or id.", correct: true}, {option: "Event handler."}],
        difficulty: 1,
        type: "css"
      }).insert(function (err, question) {
        Question.removeById(question._id, function (err, count) {
          expect(count).to.be.eql(1);
          done();
        });
      });
    });
  });
});
