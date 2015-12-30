process.env.DBNAME = "quiz-world-test";
var expect = require("chai").expect;
var request = require("supertest");
var fs = require("fs");
var exec = require("child_process").exec;
var app = require("../../lib/app");
var expect = require("chai").expect;
var data = require("../fixtures/questions");
var _ = require("lodash");
var User, Question, Session, sessionId, questionId, correctAnswer, wrongAnswer, id, initMongo, token, cookie, id2;

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
      email: "admin@admin.com",
      password: "Password1",
      role: "admin"
    }).register(function (err, admin) {
      expect(admin._id.toString()).to.have.length(24);

      new User({
        email: "foo@test.com",
        password: "Password1"
      }).register(function (err, user) {
        expect(user._id.toString()).to.have.length(24);

        Question.bulkInsert(data.bulkQuestions, function (err, questions) {
          questionId = questions[0]._id.toString();
          correctAnswer = _.pluck(_.filter(questions[0].options, "correct"), "option")[0];
          wrongAnswer = _.pluck(_.filter(questions[0].options), "option")[0];
          expect(questions).to.have.length(182);

          new Session({
            quantity: 20,
            difficulty: 2,
            type: ["html", "css", "js"]
          }).insert(function (err, session) {
            sessionId = session._id.toString();
            expect(session._id.toString()).to.have.length(24);

            session.update({userId: user._id.toString()}, function (err, count) {
              expect(count).to.be.eql(1);
              done();
            });
          });
        })
      });
    });
  });

  describe("GET /sessions", function () {
    it("should return not authorized", function (done) {
      request(app)
      .post("/login")
      .send({
        "email": "foo@test.com",
        "password": "Password1",
        "session": sessionId
      })
      .end(function (err, res) {
        token = res.body.token;
        cookie = res.headers["set-cookie"];
        expect(res.status).to.equal(200);

        request(app)
        .get("/sessions")
        .set("cookie", cookie)
        .set("session-id", token)
        .end(function (err, res) {
          expect(res.status).to.equal(401);
          expect(res.body.message).to.equal("User not authorized.");
          done();
        });
      });
    });

    it("should return all sessions", function (done) {
      request(app)
      .post("/login")
      .send({
        "email": "admin@admin.com",
        "password": "Password1",
        "session": sessionId
      })
      .end(function (err, res) {
        token = res.body.token;
        cookie = res.headers["set-cookie"];
        expect(res.status).to.equal(200);

        request(app)
        .get("/sessions")
        .set("cookie", cookie)
        .set("session-id", token)
        .end(function (err, res) {

          expect(res.status).to.equal(200);
          done();
        });
      });
    });
  });

  describe("GET /sessions/:id", function () {
    it("should return not authorized", function (done) {
      request(app)
      .post("/login")
      .send({
        "email": "foo@test.com",
        "password": "Password1",
        "session": sessionId
      })
      .end(function (err, res) {
        token = res.body.token;
        cookie = res.headers["set-cookie"];
        expect(res.status).to.equal(200);

        request(app)
        .get("/sessions/".concat(sessionId))
        .set("cookie", cookie)
        .set("session-id", token)
        .end(function (err, res) {
          expect(res.status).to.equal(401);
          expect(res.body.message).to.equal("User not authorized.");
          done();
        });
      });
    });

    it("should return a session", function (done) {
      request(app)
      .post("/login")
      .send({
        "email": "admin@admin.com",
        "password": "Password1",
        "session": sessionId
      })
      .end(function (err, res) {
        token = res.body.token;
        cookie = res.headers["set-cookie"];
        expect(res.status).to.equal(200);

        request(app)
        .get("/sessions/".concat(sessionId))
        .set("cookie", cookie)
        .set("session-id", token)
        .end(function (err, res) {

          expect(res.status).to.equal(200);
          done();
        });
      });
    });

    it("should return a session", function (done) {
      request(app)
      .post("/login")
      .send({
        "email": "admin@admin.com",
        "password": "Password1",
        "session": sessionId
      })
      .end(function (err, res) {
        token = res.body.token;
        cookie = res.headers["set-cookie"];
        expect(res.status).to.equal(200);

        request(app)
        .get("/sessions/".concat("1234ABCDabcd1234ABCDabcd"))
        .set("cookie", cookie)
        .set("session-id", token)
        .end(function (err, res) {
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
  });

  describe("delete /sessions/:id", function () {
    it("should return not authorized", function (done) {
      request(app)
      .post("/login")
      .send({
        "email": "foo@test.com",
        "password": "Password1",
        "session": sessionId
      })
      .end(function (err, res) {
        token = res.body.token;
        cookie = res.headers["set-cookie"];
        expect(res.status).to.equal(200);

        request(app)
        .delete("/sessions/".concat(sessionId))
        .set("cookie", cookie)
        .set("session-id", token)
        .end(function (err, res) {
          expect(res.status).to.equal(401);
          expect(res.body.message).to.equal("User not authorized.");
          done();
        });
      });
    });

    it("should delete a session", function (done) {
      request(app)
      .post("/login")
      .send({
        "email": "admin@admin.com",
        "password": "Password1",
        "session": sessionId
      })
      .end(function (err, res) {
        token = res.body.token;
        cookie = res.headers["set-cookie"];
        expect(res.status).to.equal(200);

        request(app)
        .delete("/sessions/".concat(sessionId))
        .set("cookie", cookie)
        .set("session-id", token)
        .end(function (err, res) {
          expect(res.status).to.equal(201);
          expect(res.body.message).to.equal("Session successfully deleted.");
          done();
        });
      });
    });
  });

  describe("POST /sessions", function () {
    it("should return 400 missing body", function (done) {
      request(app)
      .post("/login")
      .send({
        "email": "admin@admin.com",
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
        "email": "admin@admin.com",
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
        "email": "admin@admin.com",
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
        "email": "admin@admin.com",
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
        "email": "admin@admin.com",
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
        "email": "admin@admin.com",
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
        "email": "admin@admin.com",
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

  describe("PUT /sessions/:id", function () {
    it("should require body", function (done) {
      request(app)
      .post("/login")
      .send({
        "email": "foo@test.com",
        "password": "Password1",
        "session": sessionId
      })
      .end(function (err, res) {
        token = res.body.token;
        cookie = res.headers["set-cookie"];
        expect(res.status).to.equal(200);

        request(app)
        .put("/sessions/".concat(sessionId))
        .set("cookie", cookie)
        .set("session-id", token)
        .end(function (err, res) {
          expect(res.status).to.equal(400);
          expect(res.body.message).to.equal("Invalid request.");
          done();
        });
      });
    });

    it("should update session as timed out", function (done) {
      request(app)
      .post("/login")
      .send({
        "email": "foo@test.com",
        "password": "Password1",
        "session": sessionId
      })
      .end(function (err, res) {
        token = res.body.token;
        cookie = res.headers["set-cookie"];
        expect(res.status).to.equal(200);

        request(app)
        .put("/sessions/".concat(sessionId))
        .set("cookie", cookie)
        .set("session-id", token)
        .send({
          questionId: questionId
        })
        .end(function (err, res) {
          expect(res.status).to.equal(201);
          expect(res.body.message).to.equal("Session successfully updated.");
          done();
        });
      });
    });

    it("should update session for correct choice", function (done) {
      request(app)
      .post("/login")
      .send({
        "email": "foo@test.com",
        "password": "Password1",
        "session": sessionId
      })
      .end(function (err, res) {
        token = res.body.token;
        cookie = res.headers["set-cookie"];
        expect(res.status).to.equal(200);

        request(app)
        .put("/sessions/".concat(sessionId))
        .set("cookie", cookie)
        .set("session-id", token)
        .send({
          questionId: questionId,
          answer: correctAnswer
        })
        .end(function (err, res) {
          expect(res.status).to.equal(201);
          expect(res.body.message).to.equal("Session successfully updated.");
          done();
        });
      });
    });

    it("should update session for wrong choice", function (done) {
      request(app)
      .post("/login")
      .send({
        "email": "foo@test.com",
        "password": "Password1",
        "session": sessionId
      })
      .end(function (err, res) {
        token = res.body.token;
        cookie = res.headers["set-cookie"];
        expect(res.status).to.equal(200);

        request(app)
        .put("/sessions/".concat(sessionId))
        .set("cookie", cookie)
        .set("session-id", token)
        .send({
          questionId: questionId,
          answer: wrongAnswer
        })
        .end(function (err, res) {
          expect(res.status).to.equal(201);
          expect(res.body.message).to.equal("Session successfully updated.");
          done();
        });
      });
    });
  });
});
