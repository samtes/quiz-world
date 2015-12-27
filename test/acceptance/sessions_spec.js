process.env.DBNAME = "quiz-world-test";
var expect = require("chai").expect;
var request = require("supertest");
var fs = require("fs");
var exec = require("child_process").exec;
var app = require("../../lib/app");
var expect = require("chai").expect;
var data = require("../fixtures/questions");
var User, Question, Session, id, initMongo, token, cookie, id2;

describe("sessions route", function(){
  before(function (done) {
    User = require("../../lib/models/user");
    Question = require("../../lib/models/question");
    Session = require("../../lib/models/session");
    initMongo = require("../../lib/server/init-mongo");
    done();
  });

  beforeEach(function (done) {
    initMongo.db.collection("users").drop();
    initMongo.db.collection("questions").drop();
    initMongo.db.collection("sessions").drop();

    new User({
      email: "foo@test.com",
      password: "Password1"
    }).register(function (err, user) {
      expect(user._id.toString()).to.have.length(24);

      new User({
        email: "zoo@test.com",
        password: "Password1",
        role: "admin"
      }).register(function (err, user) {
        expect(user._id.toString()).to.have.length(24);

        Question.bulkInsert(data.bulkQuestions, function (err, questions) {
          expect(questions).to.have.length(182);
          done();
        })
      });
    });
  });

  describe("POST /sessions", function () {
    it("should return 400 missing body", function (done) {
      request(app)
      .post("/login")
      .send({
        "email": "zoo@test.com",
        "password": "Password1",
        "session": "session"
      })
      .end(function (err, res) {
        token = res.body.token;
        cookie = res.headers["set-cookie"];
        expect(res.status).to.equal(200);

        request(app)
        .post("/sessions")
        .set("cookie", cookie)
        .set("session-id", token)
        .end(function (err, res) {
          expect(res.status).to.equal(400);
          expect(res.body.message).to.equal("Invalid request.");
          done();
        });
      });
    });

    it("should return 400 missing type of question", function (done) {
      request(app)
      .post("/login")
      .send({
        "email": "zoo@test.com",
        "password": "Password1",
        "session": "session"
      })
      .end(function (err, res) {
        token = res.body.token;
        cookie = res.headers["set-cookie"];
        expect(res.status).to.equal(200);

        request(app)
        .post("/sessions")
        .set("cookie", cookie)
        .set("session-id", token)
        .send({
          quantity: 20,
          difficulty: 1
        })
        .end(function (err, res) {
          expect(res.status).to.equal(400);
          expect(res.body.message).to.equal("Invalid request.");
          done();
        });
      });
    });

    it("should return 400 missing difficulty", function (done) {
      request(app)
      .post("/login")
      .send({
        "email": "zoo@test.com",
        "password": "Password1",
        "session": "session"
      })
      .end(function (err, res) {
        token = res.body.token;
        cookie = res.headers["set-cookie"];
        expect(res.status).to.equal(200);

        request(app)
        .post("/sessions")
        .set("cookie", cookie)
        .set("session-id", token)
        .send({
          quantity: 20,
          type: "html"
        })
        .end(function (err, res) {
          expect(res.status).to.equal(400);
          expect(res.body.message).to.equal("Invalid request.");
          done();
        });
      });
    });

    it("should return 400 missing quantity", function (done) {
      request(app)
      .post("/login")
      .send({
        "email": "zoo@test.com",
        "password": "Password1",
        "session": "session"
      })
      .end(function (err, res) {
        token = res.body.token;
        cookie = res.headers["set-cookie"];
        expect(res.status).to.equal(200);

        request(app)
        .post("/sessions")
        .set("cookie", cookie)
        .set("session-id", token)
        .send({
          difficulty: 2,
          type: "html"
        })
        .end(function (err, res) {
          expect(res.status).to.equal(400);
          expect(res.body.message).to.equal("Invalid request.");
          done();
        });
      });
    });

    it("should generate session", function (done) {
      request(app)
      .post("/login")
      .send({
        "email": "zoo@test.com",
        "password": "Password1",
        "session": "session"
      })
      .end(function (err, res) {
        token = res.body.token;
        cookie = res.headers["set-cookie"];
        expect(res.status).to.equal(200);

        request(app)
        .post("/sessions")
        .set("cookie", cookie)
        .set("session-id", token)
        .send({
          difficulty: 2,
          quantity: 10,
          type: "html"
        })
        .expect(201, done);
      });
    });

    it("should generate session multiple type", function (done) {
      request(app)
      .post("/login")
      .send({
        "email": "zoo@test.com",
        "password": "Password1",
        "session": "session"
      })
      .end(function (err, res) {
        token = res.body.token;
        cookie = res.headers["set-cookie"];
        expect(res.status).to.equal(200);

        request(app)
        .post("/sessions")
        .set("cookie", cookie)
        .set("session-id", token)
        .send({
          difficulty: 2,
          quantity: 10,
          type: ["html", "css"]
        })
        .expect(201, done);
      });
    });

    it("should return not enough questions in the database", function (done) {
      request(app)
      .post("/login")
      .send({
        "email": "zoo@test.com",
        "password": "Password1",
        "session": "session"
      })
      .end(function (err, res) {
        token = res.body.token;
        cookie = res.headers["set-cookie"];
        expect(res.status).to.equal(200);

        request(app)
        .post("/sessions")
        .set("cookie", cookie)
        .set("session-id", token)
        .send({
          difficulty: 2,
          quantity: 200,
          type: ["html", "css"]
        })
        .end(function (err, res) {
          expect(res.status).to.equal(422);
          expect(res.body.message).to.equal("Not enough questions in database.");
          done();
        });
      });
    });
  });
});
