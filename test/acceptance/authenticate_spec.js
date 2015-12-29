process.env.DBNAME = "quiz-world-test";
var expect = require("chai").expect;
var request = require("supertest");
var fs = require("fs");
var exec = require("child_process").exec;
var app = require("../../lib/app");
var expect = require("chai").expect;
var User, Session, initMongo;
var cookie, sessionId;

describe("Authentication route", function(){
  before(function (done) {
    User = require("../../lib/models/user");
    Session = require("../../lib/models/session");
    initMongo = require("../../lib/server/init-mongo");
    done();
  });

  beforeEach(function (done) {
    initMongo.db.collection("users").drop();

    new User({
      email: "admin@admin.com",
      password: "Password1",
      role: "admin"
    }).register(function (err, admin) {
      expect(admin._id.toString()).to.have.length(24);

      new User({
        email: "rob@test.com",
        password: "Password1"
      }).register(function (err, user) {
        expect(user._id.toString()).to.have.length(24);

        new Session({
          quantity: 8,
          difficulty: 1,
          type: ["css","html"],
          questions: ["123412341230", "123412341231", "123412341232", "123412341233", "123412341234", "123412341235", "123412341236", "123412341237"]
        }).insert(function (err, session) {
          sessionId = session._id.toString();
          expect(session._id.toString()).to.have.length(24);

          session.update({userId: user._id.toString()}, function (err, count) {
            expect(count).to.be.eql(1);
            done();
          });
        });
      });
    });
  });

  describe("POST /login", function () {
    it("should return token for admin", function (done) {
      request(app)
      .post("/login")
      .send({
        "email": "admin@admin.com",
        "password": "Password1",
        "session": ""
      })
      .end(function (err, res) {
        expect(res.status).to.equal(200);
        done();
      });
    });

    it("should return token", function (done) {
      request(app)
      .post("/login")
      .send({
        "email": "rob@test.com",
        "password": "Password1",
        "session": sessionId
      })
      .end(function (err, res) {
        expect(res.status).to.equal(200);
        done();
      });
    });

    it("should not return token with no body", function (done) {
      request(app)
      .post("/login")
      .end(function (err, res) {
        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal("Invalid request.")
        done();
      });
    });

    it("should return user not found", function (done) {
      request(app)
      .post("/login")
      .send({
        "email": "jimmy@test.com",
        "password": "Password1",
        "session": sessionId
      })
      .end(function (err, res) {
        expect(res.status).to.equal(404);
        expect(res.body.message).to.equal("User not found.");
        done();
      });
    });

    it("should return user not found", function (done) {
      request(app)
      .post("/login")
      .send({
        "email": "rob@test.com",
        "password": "Password123",
        "session": sessionId
      })
      .end(function (err, res) {
        expect(res.status).to.equal(404);
        expect(res.body.message).to.equal("User not found.");
        done();
      });
    });

    it("should not return token with no email", function (done) {
      request(app)
      .post("/login")
      .send({
        "password": "Password1",
        "session": sessionId
      })
      .end(function (err, res) {
        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal("Invalid request.")
        done();
      });
    });

    it("should not return token with no password", function (done) {
      request(app)
      .post("/login")
      .send({
        "email": "rob@test.com",
        "session": sessionId
      })
      .end(function (err, res) {
        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal("Invalid request.")
        done();
      });
    });

    it("should return session required", function (done) {
      request(app)
      .post("/login")
      .send({
        "email": "rob@test.com",
        "password": "Password1"
      })
      .end(function (err, res) {
        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal("Session is required.")
        done();
      });
    });

    it("should return invalid session", function (done) {
      request(app)
      .post("/login")
      .send({
        "email": "rob@test.com",
        "password": "Password1",
        "session": "invalid_session"
      })
      .end(function (err, res) {
        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal("Invalid session.")
        done();
      });
    });
  });

  describe("DELETE /login", function () {
    it("should return token", function (done) {
      request(app)
      .delete("/login")
      .end(function (err, res) {
        expect(res.status).to.equal(200);
        done();
      });
    });
  });
});
