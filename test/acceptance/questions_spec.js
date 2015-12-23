process.env.DBNAME = "quiz-world-test";
var expect = require("chai").expect;
var request = require("supertest");
var fs = require("fs");
var exec = require("child_process").exec;
var app = require("../../lib/app");
var expect = require("chai").expect;
var User, Question, id, initMongo, token, cookie, id2;

describe("questions route", function(){
  before(function (done) {
    User = require("../../lib/models/user");
    Question = require("../../lib/models/question");
    initMongo = require("../../lib/server/init-mongo");
    done();
  });

  beforeEach(function (done) {
    initMongo.db.collection("users").drop();
    initMongo.db.collection("questions").drop();

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

        new Question({
          question: "This is the first question?",
          options: [{option: "Color."}, {option: "DOM elements."}, {option: "Class or id.", correct: true}, {option: "Event handler."}],
          difficulty: 1,
          type: "css"
        }).insert(function (err, question) {
          id = question._id.toString();
          expect(question._id.toString()).to.have.length(24);

          new Question({
            question: "This is the second question?",
            options: [{option: "Color."}, {option: "DOM elements."}, {option: "Class or id.", correct: true}, {option: "Event handler."}],
            difficulty: 1,
            type: "css"
          }).insert(function (err, question) {
            id2 = question._id.toString();
            expect(question._id.toString()).to.have.length(24);
            done();
          });
        })
      });
    });
  });

  describe("POST /questions", function () {
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
        .post("/questions")
        .set("cookie", cookie)
        .set("session-id", token)
        .expect(400, done);
      });
    });

    it("should return 400 missing css", function (done) {
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
        .post("/questions")
        .set("cookie", cookie)
        .set("session-id", token)
        .send({
          question: "This is the new question?",
          options: [{option: "Color."}, {option: "DOM elements."}, {option: "Class or id.", correct: true}, {option: "Event handler."}],
          difficulty: 1
        })
        .expect(400, done);
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
        .post("/questions")
        .set("cookie", cookie)
        .set("session-id", token)
        .send({
          question: "This is the new question?",
          options: [{option: "Color."}, {option: "DOM elements."}, {option: "Class or id.", correct: true}, {option: "Event handler."}],
          type: "css"
        })
        .expect(400, done);
      });
    });

    it("should return 400 missing options", function (done) {
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
        .post("/questions")
        .set("cookie", cookie)
        .set("session-id", token)
        .send({
          question: "This is the new question?",
          difficulty: 1,
          type: "css"
        })
        .expect(400, done);
      });
    });

    it("should return 400 missing options correct answer", function (done) {
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
        .post("/questions")
        .set("cookie", cookie)
        .set("session-id", token)
        .send({
          question: "This is the new question?",
          options: [{option: "Color."}, {option: "DOM elements."}, {option: "Class or id."}, {option: "Event handler."}],
          difficulty: 1,
          type: "css"
        })
        .expect(400, done);
      });
    });

    it("should return 400 missing question", function (done) {
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
        .post("/questions")
        .set("cookie", cookie)
        .set("session-id", token)
        .send({
          options: [{option: "Color."}, {option: "DOM elements."}, {option: "Class or id.", correct: true}, {option: "Event handler."}],
          difficulty: 1,
          type: "css"
        })
        .expect(400, done);
      });
    });

    it("should return 401", function (done) {
      request(app)
      .post("/login")
      .send({
        "email": "foo@test.com",
        "password": "Password1",
        "session": "session"
      })
      .end(function (err, res) {
        token = res.body.token;
        cookie = res.headers["set-cookie"];
        expect(res.status).to.equal(200);

        request(app)
        .post("/questions")
        .set("cookie", cookie)
        .set("session-id", token)
        .expect(401, done);
      });
    });

    it("should insert a question", function (done) {
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
        .post("/questions")
        .set("cookie", cookie)
        .set("session-id", token)
        .send({
          question: "This is the new question?",
          options: [{option: "Color."}, {option: "DOM elements."}, {option: "Class or id.", correct: true}, {option: "Event handler."}],
          difficulty: 1,
          type: "css"
        })
        .expect(201, done);
      });
    });
  });

  describe("GET /questions/:id", function () {
    it("should not return a question", function (done) {
      request(app)
      .post("/login")
      .send({
        "email": "foo@test.com",
        "password": "Password1",
        "session": "session"
      })
      .end(function (err, res) {
        token = res.body.token;
        cookie = res.headers["set-cookie"];
        expect(res.status).to.equal(200);

        request(app)
        .get("/questions/".concat(id))
        .set("cookie", cookie)
        .set("session-id", token)
        .expect(401, done);
      });
    });

    it("should return a questions", function (done) {
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
        .get("/questions/".concat(id))
        .set("cookie", cookie)
        .set("session-id", token)
        .expect(200, done);
      });
    });
  });

  describe("PUT /questions/:id", function () {
    it("user should not update question", function (done) {
      request(app)
      .post("/login")
      .send({
        "email": "foo@test.com",
        "password": "Password1",
        "session": "session"
      })
      .end(function (err, res) {
        token = res.body.token;
        cookie = res.headers["set-cookie"];
        expect(res.status).to.equal(200);

        request(app)
        .put("/questions/".concat(id))
        .set("cookie", cookie)
        .set("session-id", token)
        .send({"question": "This is the new question"})
        .end(function (err, res) {
          expect(res.status).to.equal(401);
          expect(res.body.message).to.equal("User not authorized.");
          done();
        });
      });
    });

    it("Admin should not update question without body", function (done) {
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
        .put("/questions/".concat(id))
        .set("cookie", cookie)
        .set("session-id", token)
        .end(function (err, res) {
          expect(res.status).to.equal(400);
          expect(res.body.message).to.equal("Invalid request.");
          done();
        });
      });
    });

    it("admin should update question", function (done) {
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
        .put("/questions/".concat(id2))
        .set("cookie", cookie)
        .set("session-id", token)
        .send({"question": "This is the new question"})
        .end(function (err, res) {
          expect(res.status).to.equal(201);
          expect(res.body.message).to.equal("Question successfully updated.");
          done();
        });
      });
    });
  });

  describe("DELETE /questions/:id", function () {
    it("user should not delete question", function (done) {
      request(app)
      .post("/login")
      .send({
        "email": "foo@test.com",
        "password": "Password1",
        "session": "session"
      })
      .end(function (err, res) {
        token = res.body.token;
        cookie = res.headers["set-cookie"];
        expect(res.status).to.equal(200);

        request(app)
        .delete("/questions/".concat(id))
        .set("cookie", cookie)
        .set("session-id", token)
        .end(function (err, res) {
          expect(res.status).to.equal(401);
          expect(res.body.message).to.equal("User not authorized.");
          done();
        });
      });
    });

    it("admin should delete question", function (done) {
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
        .delete("/questions/".concat(id))
        .set("cookie", cookie)
        .set("session-id", token)
        .end(function (err, res) {
          expect(res.status).to.equal(201);
          expect(res.body.message).to.equal("Question successfully deleted.");
          done();
        });
      });
    });
  });

  it("should return 422", function (done) {
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
      .delete("/questions/".concat("123412341234"))
      .set("cookie", cookie)
      .set("session-id", token)
      .end(function (err, res) {
        expect(res.status).to.equal(422);
        expect(res.body.message).to.equal("Request not processed.");
        done();
      });
    });
  });
});
