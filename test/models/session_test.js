process.env.DBNAME = "quiz-world-test";
var expect = require("chai").expect;
var data = require("../fixtures/questions");
var Question, Session, initMongo;

describe("Session",  function () {
  before(function (done) {
    Session = require("../../lib/models/session");
    Question = require("../../lib/models/question");
    initMongo = require("../../lib/server/init-mongo");
    done();
  });

  afterEach(function (done) {
    initMongo.db.collection("questions").drop();
    initMongo.db.collection("sessions").drop();
    done();
  });

  describe("new", function () {
    it("should be an instance of Question", function (done) {
      var sess = new Session({
        quantity: 8,
        difficulty: 1,
        type: ["css", "html"],
        questions: ["123412341230", "123412341231", "123412341232", "123412341233", "123412341234", "123412341235", "123412341236", "123412341237"]
      });

      expect(sess).to.be.an.instanceof(Session);
      done();
    });
  });

  describe("#insert", function () {
    it("inserts a session", function (done) {
      new Session({
        quantity: 8,
        difficulty: 1,
        type: ["css","html"],
        questions: ["123412341230", "123412341231", "123412341232", "123412341233", "123412341234", "123412341235", "123412341236", "123412341237"]
      }).insert(function (err, session) {
        expect(session._id.toString()).to.have.length(24);
        done();
      });
    });
  });

  describe(".findById", function () {
    it("returns 404", function (done) {
      Session.findById("123456789012", function (err, session) {
        expect(err.message).to.be.eql("Session not found.");
        done();
      });
    });

    it("returns session", function (done) {
      new Session({
        quantity: 8,
        difficulty: 1,
        type: ["css","html"],
        questions: ["123412341230", "123412341231", "123412341232", "123412341233", "123412341234", "123412341235", "123412341236", "123412341237"]
      }).insert(function (err, sess1) {
        expect(sess1._id.toString()).to.have.length(24);

        new Session({
          quantity: 6,
          difficulty: 3,
          type: ["css","qa"],
          questions: ["123412341211", "123412341212", "123412341213", "123412341214", "123412341215", "123412341216"]
        }).insert(function (err, sess2) {
          expect(sess2._id.toString()).to.have.length(24);

          Session.findById(sess1._id.toString(), function (err, session) {
            expect(session.type.join(":")).to.be.eql("css:html");
            done();
          });
        });
      });
    });
  });

  describe("#update", function () {
    it("updates correct result", function (done) {
      new Session({
        quantity: 6,
        difficulty: 3,
        type: ["css","qa"],
        questions: ["123412341211", "123412341212", "123412341213", "123412341214", "123412341215", "123412341216"],
      }).insert(function (err, session) {
        expect(session._id.toString()).to.have.length(24);

        session.correct.push("123412341211");
        session.update({
          correct: session.correct
        }, function (err, count) {
          expect(count).to.be.eql(1);

          Session.findById(session._id.toString(), function (err, session) {
            session.correct.push("123412341212");
            session.update({
              correct: session.correct
            }, function (err, count) {
              expect(count).to.be.eql(1);

              Session.findById(session._id.toString(), function (err, session) {
                expect(session.correct.length).to.be.eql(2);
                expect(session.correct).to.be.eql(["123412341211", "123412341212"]);123412341212
                done();
              });
            });
          });
        });
      });
    });

    it("updates wrong result", function (done) {
      new Session({
        quantity: 6,
        difficulty: 3,
        type: ["css","qa"],
        questions: ["123412341211", "123412341212", "123412341213", "123412341214", "123412341215", "123412341216"],
      }).insert(function (err, session) {
        expect(session._id.toString()).to.have.length(24);

        session.wrong.push({question: "123412341211", choice: "This is the wrong answer."});
        session.update({
          wrong: session.wrong
        }, function (err, count) {
          expect(count).to.be.eql(1);

          Session.findById(session._id.toString(), function (err, session) {
            session.wrong.push({question: "123412341212", choice: "This is the second wrong choice."});
            session.update({
              wrong: session.wrong
            }, function (err, count) {
              expect(count).to.be.eql(1);

              Session.findById(session._id.toString(), function (err, session) {
                expect(session.wrong.length).to.be.eql(2);
                expect(session.wrong).to.be.eql([{question: "123412341211", choice: "This is the wrong answer."}, {question: "123412341212", choice: "This is the second wrong choice."}]);123412341212
                done();
              });
            });
          });
        });
      });
    });
  });

  describe(".removeById", function () {
    it("should remove session", function (done) {
      new Session({
        quantity: 6,
        difficulty: 3,
        type: ["css","qa"],
        questions: ["123412341211", "123412341212", "123412341213", "123412341214", "123412341215", "123412341216"],
      }).insert(function (err, session) {
        expect(session._id.toString()).to.have.length(24);

        Session.removeById(session._id.toString(), function (err, count) {
          expect(count).to.be.eql(1);
          done();
        });
      });
    });

    it("should not remove session", function (done) {
      new Session({
        quantity: 6,
        difficulty: 3,
        type: ["css","qa"],
        questions: ["123412341211", "123412341212", "123412341213", "123412341214", "123412341215", "123412341216"],
      }).insert(function (err, session) {
        expect(session._id.toString()).to.have.length(24);

        Session.removeById("123412341234", function (err, count) {
          expect(count).to.be.eql(0);
          done();
        });
      });
    });
  });
});
