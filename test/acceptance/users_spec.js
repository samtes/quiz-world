process.env.DBNAME = "quiz-world-test";
var expect = require("chai").expect;
var request = require("supertest");
var fs = require("fs");
var exec = require("child_process").exec;
var app = require("../../lib/app");
var expect = require("chai").expect;
var User, Session, sessionId, id, initMongo, token, cookie, id2;

describe("users route", function(){
  before(function (done) {
    User = require("../../lib/models/user");
    Session = require("../../lib/models/session");
    initMongo = require("../../lib/server/init-mongo");
    done();
  });

  beforeEach(function (done) {
    initMongo.db.collection("users").drop();

    new User({
      email: "foo@test.com",
      password: "Password1"
    }).register(function (err, user) {
      id = user._id.toString();
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

          new User({
            email: "admin@admin.com",
            password: "Password1",
            role: "admin"
          }).register(function (err, user) {
            id2 = user._id.toString();
            expect(user._id.toString()).to.have.length(24);
            done();
          });
        });
      });

    });
  });

  describe("POST /users", function () {
    it("should register user", function (done) {
      request(app)
      .post("/users")
      .send({
        "user": {
          "email": "bobby@test.com",
          "password": "Password1",
          "confirmPassword": "Password1",
          "key": sessionId
        }
      })
      .end(function (err, res) {
        expect(res.status).to.equal(201);

        Session.findById(sessionId, function (err, session) {
          User.findByEmail("bobby@test.com", function (err, user) {
            expect(session.userId).to.be.eql(user._id.toString());
            done();
          });
        });
      });
    });

    it("should not register user with no body", function (done) {
      request(app)
      .post("/users")
      .end(function (err, res) {
        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal("Invalid request.");
        done();
      });
    });

    it("should not register user with no email", function (done) {
      request(app)
      .post("/users")
      .send({
        "users": {
          "password": "Password1",
          "confirmPassword": "Password1"
        }
      })
      .end(function (err, res) {
        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal("Invalid request.");
        done();
      });
    });

    it("should not register user with no password", function (done) {
      request(app)
      .post("/users")
      .send({
        "users": {
          "email": "bobby@test.com",
          "confirmPassword": "Password1"
        }
      })
      .end(function (err, res) {
        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal("Invalid request.");
        done();
      });
    });

    it("should not register user with no confirmPassword", function (done) {
      request(app)
      .post("/users")
      .send({
        "users": {
          "email": "bobby@test.com",
          "password": "Password1"
        }
      })
      .end(function (err, res) {
        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal("Invalid request.");
        done();
      });
    });

    it("should not register without a session", function (done) {
      request(app)
      .post("/users")
      .send({
        "user": {
          "email": "samiboy@test.com",
          "password": "Password1",
          "confirmPassword": "Password1",
          "key": "123412341234123412341234"
        }
      })
      .end(function (err, res) {
        expect(res.status).to.equal(404);
        expect(res.body.message).to.equal("Session not found.");
        done();
      });
    });


    it("should not register duplicate user", function (done) {
      request(app)
      .post("/users")
      .send({
        "user": {
          "email": "admin@admin.com",
          "password": "Password1",
          "confirmPassword": "Password1",
          "key": sessionId
        }
      })
      .end(function (err, res) {
        expect(res.status).to.equal(422);
        expect(res.body.message).to.equal("User already exists.");
        done();
      });
    });

    it("should not register user with no number in password", function (done) {
      request(app)
      .post("/users")
      .send({
        "user": {
          "email": "bobby@test.com",
          "password": "Password",
          "confirmPassword": "Password"
        }
      })
      .end(function (err, res) {
        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal("Invalid password.");
        done();
      });
    });

    it("should not register user with no uppercase in password", function (done) {
      request(app)
      .post("/users")
      .send({
        "user": {
          "email": "bobby@test.com",
          "password": "password1",
          "confirmPassword": "password1"
        }
      })
      .end(function (err, res) {
        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal("Invalid password.");
        done();
      });
    });

    it("should not register user with no lowercase in password", function (done) {
      request(app)
      .post("/users")
      .send({
        "user": {
          "email": "bobby@test.com",
          "password": "PASSWORD1",
          "confirmPassword": "PASSWORD1"
        }
      })
      .end(function (err, res) {
        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal("Invalid password.");
        done();
      });
    });

    it("should not register user with mismatch password", function (done) {
      request(app)
      .post("/users")
      .send({
        "user": {
          "email": "bobby@test.com",
          "password": "Password1",
          "confirmPassword": "Password"
        }
      })
      .end(function (err, res) {
        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal("Password mismatch.");
        done();
      });
    });

    it("should not register user with invalid email missing \"@\"", function (done) {
      request(app)
      .post("/users")
      .send({
        "user": {
          "email": "bobbytest.com",
          "password": "Password1",
          "confirmPassword": "Password1"
        }
      })
      .end(function (err, res) {
        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal("Invalid email.");
        done();
      });
    });

    it("should not register user with invalid email missing \".\"", function (done) {
      request(app)
      .post("/users")
      .send({
        "user": {
          "email": "bobbytest.com",
          "password": "Password1",
          "confirmPassword": "Password1"
        }
      })
      .end(function (err, res) {
        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal("Invalid email.");
        done();
      });
    });
  });

  describe("GET /users", function () {
    it("should not return users", function (done) {
      request(app)
      .post("/login")
      .send({
        "username": "foo@test.com",
        "password": "Password1",
        "key": sessionId
      })
      .end(function (err, res) {
        token = res.body.token;
        cookie = res.headers["set-cookie"];
        expect(res.status).to.equal(200);

        request(app)
        .get("/users")
        .set("cookie", cookie)
        .set("session-id", token)
        .expect(401, done);
      });
    });

    it("should return all users", function (done) {
      request(app)
      .post("/login")
      .send({
        "username": "admin@admin.com",
        "password": "Password1",
        "key": "session"
      })
      .end(function (err, res) {
        token = res.body.token;
        cookie = res.headers["set-cookie"];
        expect(res.status).to.equal(200);

        request(app)
        .get("/users")
        .set("cookie", cookie)
        .set("session-id", token)
        .expect(200, done);
      });
    });
  });

  describe("GET /users/:id", function () {
    it("should return 401", function (done) {
      request(app)
      .post("/login")
      .send({
        "username": "foo@test.com",
        "password": "Password1",
        "key": sessionId
      })
      .end(function (err, res) {
        token = res.body.token;
        cookie = res.headers["set-cookie"];
        expect(res.status).to.equal(200);

        request(app)
        .get("/users/".concat(id2))
        .set("cookie", cookie)
        .set("session-id", token)
        .expect(401, done);
      });
    });

    it("should return user", function (done) {
      request(app)
      .post("/login")
      .send({
        "username": "foo@test.com",
        "password": "Password1",
        "key": sessionId
      })
      .end(function (err, res) {
        id = res.body.userID;
        token = res.body.token;
        cookie = res.headers["set-cookie"];
        expect(res.status).to.equal(200);

        request(app)
        .get("/users/".concat(id))
        .set("cookie", cookie)
        .set("session-id", token)
        .expect(200, done);
      });
    });
  });

  describe("PUT /users/:id", function () {
    it("user should update user", function (done) {
      request(app)
      .post("/login")
      .send({
        "username": "foo@test.com",
        "password": "Password1",
        "key": sessionId
      })
      .end(function (err, res) {
        id = res.body.userID;
        token = res.body.token;
        cookie = res.headers["set-cookie"];
        expect(res.status).to.equal(200);

        request(app)
        .put("/users/".concat(id))
        .set("cookie", cookie)
        .set("session-id", token)
        .send({"email": "foof@test.com"})
        .end(function (err, res) {
          expect(res.status).to.equal(201);
          expect(res.body.message).to.equal("User successfully updated.");
          done();
        });
      });
    });

    it("admin should update users", function (done) {
      request(app)
      .post("/login")
      .send({
        "username": "admin@admin.com",
        "password": "Password1",
        "key": "session"
      })
      .end(function (err, res) {
        token = res.body.token;
        cookie = res.headers["set-cookie"];
        expect(res.status).to.equal(200);

        request(app)
        .put("/users/".concat(id))
        .set("cookie", cookie)
        .set("session-id", token)
        .send({"email": "foof@test.com"})
        .end(function (err, res) {
          expect(res.status).to.equal(201);
          expect(res.body.message).to.equal("User successfully updated.");
          done();
        });
      });
    });

    it("admin should update self", function (done) {
      request(app)
      .post("/login")
      .send({
        "username": "admin@admin.com",
        "password": "Password1",
        "key": "session"
      })
      .end(function (err, res) {
        token = res.body.token;
        cookie = res.headers["set-cookie"];
        expect(res.status).to.equal(200);

        request(app)
        .put("/users/".concat(id2))
        .set("cookie", cookie)
        .set("session-id", token)
        .send({"email": "foof@test.com"})
        .end(function (err, res) {
          expect(res.status).to.equal(201);
          expect(res.body.message).to.equal("User successfully updated.");
          done();
        });
      });
    });

    it("should return email taken", function (done) {
      request(app)
      .post("/login")
      .send({
        "username": "foo@test.com",
        "password": "Password1",
        "key": sessionId
      })
      .end(function (err, res) {
        id = res.body.userID;
        token = res.body.token;
        cookie = res.headers["set-cookie"];
        expect(res.status).to.equal(200);

        request(app)
        .put("/users/".concat(id))
        .set("cookie", cookie)
        .set("session-id", token)
        .send({"email": "admin@admin.com"})
        .end(function (err, res) {
          expect(res.status).to.equal(422);
          expect(res.body.message).to.equal("Email already taken.");
          done();
        });
      });
    });

    it("should return invalid email missing \"@\"", function (done) {
      request(app)
      .post("/login")
      .send({
        "username": "foo@test.com",
        "password": "Password1",
        "key": sessionId
      })
      .end(function (err, res) {
        id = res.body.userID;
        token = res.body.token;
        cookie = res.headers["set-cookie"];
        expect(res.status).to.equal(200);

        request(app)
        .put("/users/".concat(id))
        .set("cookie", cookie)
        .set("session-id", token)
        .send({"email": "zootest.com"})
        .end(function (err, res) {
          expect(res.status).to.equal(400);
          expect(res.body.message).to.equal("Invalid email.");
          done();
        });
      });
    });

    it("should return invalid email missing \".\"", function (done) {
      request(app)
      .post("/login")
      .send({
        "username": "foo@test.com",
        "password": "Password1",
        "key": sessionId
      })
      .end(function (err, res) {
        id = res.body.userID;
        token = res.body.token;
        cookie = res.headers["set-cookie"];
        expect(res.status).to.equal(200);

        request(app)
        .put("/users/".concat(id))
        .set("cookie", cookie)
        .set("session-id", token)
        .send({"email": "zoo@testcom"})
        .end(function (err, res) {
          expect(res.status).to.equal(400);
          expect(res.body.message).to.equal("Invalid email.");
          done();
        });
      });
    });

    it("should return invalid password", function (done) {
      request(app)
      .post("/login")
      .send({
        "username": "foo@test.com",
        "password": "Password1",
        "key": sessionId
      })
      .end(function (err, res) {
        id = res.body.userID;
        token = res.body.token;
        cookie = res.headers["set-cookie"];
        expect(res.status).to.equal(200);

        request(app)
        .put("/users/".concat(id))
        .set("cookie", cookie)
        .set("session-id", token)
        .send({"password": "password1"})
        .end(function (err, res) {
          expect(res.status).to.equal(400);
          expect(res.body.message).to.equal("Invalid password.");
          done();
        });
      });
    });

    it("should return invalid email", function (done) {
      request(app)
      .post("/login")
      .send({
        "username": "foo@test.com",
        "password": "Password1",
        "key": sessionId
      })
      .end(function (err, res) {
        id = res.body.userID;
        token = res.body.token;
        cookie = res.headers["set-cookie"];
        expect(res.status).to.equal(200);

        request(app)
        .put("/users/".concat(id))
        .set("cookie", cookie)
        .set("session-id", token)
        .end(function (err, res) {
          expect(res.status).to.equal(400);
          expect(res.body.message).to.equal("Invalid request.");
          done();
        });
      });
    });

    it("should return 401", function (done) {
      request(app)
      .post("/login")
      .send({
        "username": "foo@test.com",
        "password": "Password1",
        "key": sessionId
      })
      .end(function (err, res) {
        id = res.body.userID;
        token = res.body.token;
        cookie = res.headers["set-cookie"];
        expect(res.status).to.equal(200);

        request(app)
        .put("/users/".concat(id2))
        .set("cookie", cookie)
        .set("session-id", token)
        .send({"email": "jimmy@test.com"})
        .end(function (err, res) {
          expect(res.status).to.equal(401);
          expect(res.body.message).to.equal("User not authorized.");
          done();
        });
      });
    });
  });

  describe("DELETE /users/:id", function () {
    it("should not delete user", function (done) {
      request(app)
      .post("/login")
      .send({
        "username": "foo@test.com",
        "password": "Password1",
        "key": sessionId
      })
      .end(function (err, res) {
        token = res.body.token;
        cookie = res.headers["set-cookie"];
        expect(res.status).to.equal(200);

        request(app)
        .delete("/users")
        .set("cookie", cookie)
        .set("session-id", token)
        .send({"email": "admin@admin.com"})
        .end(function (err, res) {
          expect(res.status).to.equal(401);
          expect(res.body.message).to.equal("User not authorized.");
          done();
        });
      });
    });

    it("should return 400 with no email", function (done) {
      request(app)
      .post("/login")
      .send({
        "username": "admin@admin.com",
        "password": "Password1",
        "key": "session"
      })
      .end(function (err, res) {
        token = res.body.token;
        cookie = res.headers["set-cookie"];
        expect(res.status).to.equal(200);

        request(app)
        .delete("/users")
        .set("cookie", cookie)
        .set("session-id", token)
        .end(function (err, res) {
          expect(res.status).to.equal(400);
          expect(res.body.message).to.equal("Invalid request.");
          done();
        });
      });
    });

    it("should return 404", function (done) {
      request(app)
      .post("/login")
      .send({
        "username": "admin@admin.com",
        "password": "Password1",
        "key": "session"
      })
      .end(function (err, res) {
        token = res.body.token;
        cookie = res.headers["set-cookie"];
        expect(res.status).to.equal(200);

        request(app)
        .delete("/users")
        .set("cookie", cookie)
        .set("session-id", token)
        .send({"email": "fooob@test.com"})
        .end(function (err, res) {
          expect(res.status).to.equal(404);
          expect(res.body.message).to.equal("User not found.");
          done();
        });
      });
    });

    it("should delete user", function (done) {
      request(app)
      .post("/login")
      .send({
        "username": "admin@admin.com",
        "password": "Password1",
        "key": "session"
      })
      .end(function (err, res) {
        token = res.body.token;
        cookie = res.headers["set-cookie"];
        expect(res.status).to.equal(200);

        request(app)
        .delete("/users")
        .set("cookie", cookie)
        .set("session-id", token)
        .send({"email": "foo@test.com"})
        .end(function (err, res) {
          expect(res.status).to.equal(201);
          expect(res.body.message).to.equal("User successfully deleted.");
          done();
        });
      });
    });
  });
});
