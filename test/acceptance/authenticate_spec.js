process.env.DBNAME = "quiz-world-test";
var expect = require("chai").expect;
var request = require("supertest");
var fs = require("fs");
var exec = require("child_process").exec;
var app = require("../../lib/app");
var expect = require("chai").expect;
var User, initMongo;
var cookie;

describe("Authentication route", function(){
  before(function (done) {
    User = require("../../lib/models/user");
    initMongo = require("../../lib/server/init-mongo");
    done();
  });

  beforeEach(function (done) {
    initMongo.db.collection("users").drop();

    new User({
      email: "rob@test.com",
      password: "Password1"
    }).register(function (err, user) {
      expect(user._id.toString()).to.have.length(24);
      done();
    });
  });

  describe("POST /login", function () {
    it("should return token", function (done) {
      request(app)
      .post("/login")
      .send({
        "email": "rob@test.com",
        "password": "Password1",
        "session": "session"
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
        "session": "session"
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
        "session": "session"
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
        "session": "session"
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
        "session": "session"
      })
      .end(function (err, res) {
        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal("Invalid request.")
        done();
      });
    });

    it("should not return token with no session", function (done) {
      request(app)
      .post("/login")
      .send({
        "email": "rob@test.com",
        "password": "Password1"
      })
      .end(function (err, res) {
        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal("Invalid request.")
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
