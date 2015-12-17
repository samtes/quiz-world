process.env.DBNAME = "quiz-world-test";
var expect = require("chai").expect;
var request = require("supertest");
var fs = require("fs");
var exec = require("child_process").exec;
var app = require("../../lib/app");
var expect = require("chai").expect;
var User, initMongo;
var cookie;

describe("Register route", function(){
  before(function (done) {
    User = require("../../lib/models/user");
    initMongo = require("../../lib/server/init-mongo");
    done();
  });

  beforeEach(function (done) {
    initMongo.db.collection("users").drop();

    new User({
      email: "sami@test.com",
      password: "Password1"
    }).register(function (err, user) {
      expect(user._id.toString()).to.have.length(24);
      done();
    });
  });

  describe("POST /register", function () {
    it("should register user", function (done) {
      request(app)
      .post("/register")
      .send({
        "email": "bobby@test.com",
        "password": "Password1",
        "confirmPassword": "Password1"
      })
      .end(function (err, res) {
        expect(res.status).to.equal(201);
        done();
      });
    });

    it("should not register user with no body", function (done) {
      request(app)
      .post("/register")
      .end(function (err, res) {
        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal("Invalid request.");
        done();
      });
    });

    it("should not register user with no email", function (done) {
      request(app)
      .post("/register")
      .send({
        "password": "Password1",
        "confirmPassword": "Password1"
      })
      .end(function (err, res) {
        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal("Invalid request.");
        done();
      });
    });

    it("should not register user with no password", function (done) {
      request(app)
      .post("/register")
      .send({
        "email": "bobby@test.com",
        "confirmPassword": "Password1"
      })
      .end(function (err, res) {
        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal("Invalid request.");
        done();
      });
    });

    it("should not register user with no confirmPassword", function (done) {
      request(app)
      .post("/register")
      .send({
        "email": "bobby@test.com",
        "password": "Password1"
      })
      .end(function (err, res) {
        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal("Invalid request.");
        done();
      });
    });

    it("should not register duplicate user", function (done) {
      request(app)
      .post("/register")
      .send({
        "email": "sami@test.com",
        "password": "Password1",
        "confirmPassword": "Password1"
      })
      .end(function (err, res) {
        expect(res.status).to.equal(422);
        expect(res.body.message).to.equal("User already exists.");
        done();
      });
    });

    it("should not register user with no number in password", function (done) {
      request(app)
      .post("/register")
      .send({
        "email": "bobby@test.com",
        "password": "Password",
        "confirmPassword": "Password"
      })
      .end(function (err, res) {
        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal("Invalid password.");
        done();
      });
    });

    it("should not register user with no uppercase in password", function (done) {
      request(app)
      .post("/register")
      .send({
        "email": "bobby@test.com",
        "password": "password1",
        "confirmPassword": "password1"
      })
      .end(function (err, res) {
        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal("Invalid password.");
        done();
      });
    });

    it("should not register user with no lowercase in password", function (done) {
      request(app)
      .post("/register")
      .send({
        "email": "bobby@test.com",
        "password": "PASSWORD1",
        "confirmPassword": "PASSWORD1"
      })
      .end(function (err, res) {
        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal("Invalid password.");
        done();
      });
    });

    it("should not register user with mismatch password", function (done) {
      request(app)
      .post("/register")
      .send({
        "email": "bobby@test.com",
        "password": "Password1",
        "confirmPassword": "Password"
      })
      .end(function (err, res) {
        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal("Password mismatch.");
        done();
      });
    });

    it("should not register user with invalid email missing \"@\"", function (done) {
      request(app)
      .post("/register")
      .send({
        "email": "bobbytest.com",
        "password": "Password1",
        "confirmPassword": "Password1"
      })
      .end(function (err, res) {
        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal("Invalid email.");
        done();
      });
    });

    it("should not register user with invalid email missing \".\"", function (done) {
      request(app)
      .post("/register")
      .send({
        "email": "bobbytest.com",
        "password": "Password1",
        "confirmPassword": "Password1"
      })
      .end(function (err, res) {
        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal("Invalid email.");
        done();
      });
    });
  });
});
