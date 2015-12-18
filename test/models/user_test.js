process.env.DBNAME = "quiz-world-test";
var expect = require("chai").expect;
var User, initMongo;

describe("User",  function () {
  before(function (done) {
    User = require("../../lib/models/user");
    initMongo = require("../../lib/server/init-mongo");
    done();
  });

  afterEach(function (done) {
    initMongo.db.collection("users").drop();
    done();
  });

  describe("new", function () {
    it("should be an instance of User", function (done) {
      var u1 = new User({
        email: "sam@nomail.com",
        password: "1234"
      });

      expect(u1).to.be.an.instanceof(User);
      done();
    });
  });

  describe("#register", function () {
    it("registers user", function (done) {
      new User({
        email: "sam@test.com",
        password: "password"
      }).register(function (err, user) {
        expect(user._id.toString()).to.have.length(24);
        expect(user.role).to.be.eql("user");
        done();
      });
    });

    it("registers admin", function (done) {
      new User({
        email: "sam@test.com",
        password: "password",
        role: "admin"
      }).register(function (err, user) {
        expect(user._id.toString()).to.have.length(24);
        expect(user.role).to.be.eql("admin");
        done();
      });
    });

    it("returns user already exists", function (done) {
      new User({
        email: "sam@test.com",
        password: "password"
      }).register(function (err, user) {
        new User({
          email: "sam@test.com",
          password: "password"
        }).register(function (err, user) {
          expect(err.message).to.be.equal("User already exists.");
          expect(err.status).to.be.equal(422);
          done();
        });
      });
    });
  });

  describe(".findById", function () {
    it("finds user by id", function (done) {
      new User({
        email: "sam@test.com",
        password: "password"
      }).register(function (err, user) {
        User.findById(user._id.toString(), function (err, user) {
          expect(user.email).to.be.equal("sam@test.com");
          done();
        });
      });
    });

    it("returns 404 for wrong id", function (done) {
      User.findById("123456789123", function (err, user) {
        expect(err.message).to.be.equal("User not found.");
        expect(err.status).to.be.equal(404);
        done();
      });
    });
  });

  describe("#update", function () {
    it("updates email", function (done) {
      new User({
        email: "sam@test.com",
        password: "password"
      }).register(function (err, user) {
        user.update({
          email: "bob@test.com"
        }, function (err, count) {
          expect(count).to.be.equal(1);
          User.findById(user._id.toString(), function (err, user) {
            expect(user.email).to.be.equal("bob@test.com");
            done();
          });
        });
      });
    });

    it("updates email", function (done) {
      new User({
        email: "sam@test.com",
        password: "password"
      }).register(function (err, user) {
        user.update({
          password: "new_password"
        }, function (err, count) {
          expect(count).to.be.equal(1);
          User.findById(user._id.toString(), function (err, user) {
            expect(user.email).to.be.equal("sam@test.com");
            done();
          });
        });
      });
    });
  });

  describe(".findByEmail", function () {
    it("finds user by email", function (done) {
      new User({
        email: "sam@test.com",
        password: "password"
      }).register(function (err, user) {
        User.findByEmail(user.email, function (err, user) {
          expect(user.email).to.be.equal("sam@test.com");
          done();
        });
      });
    });

    it("return null for not found email", function (done) {
      User.findByEmail("sam@test.com", function (err, user) {
        expect(user).to.be.null;
        done();
      });
    });
  });

  describe(".findAll", function () {
    it("finds all users", function (done) {
      new User({
        email: "sam@test.com",
        password: "password"
      }).register(function (err, user) {
        new User({
          email: "bob@test.com",
          password: "password"
        }).register(function (err, user) {
          User.findAll(function (err, users) {
            expect(users.length).to.be.equal(2);
            done();
          });
        });
      });
    });

    it("returns empty array", function (done) {
      User.findAll(function (err, users) {
        expect(users.length).to.be.equal(0);
        done();
      });
    });
  });

  describe(".findByEmailAndPassword", function () {
    it("finds user by email and password", function (done) {
      new User({
        email: "sam@test.com",
        password: "password"
      }).register(function (err, user) {
        User.findByEmailAndPassword({
          email: "sam@test.com",
          password: "password"
        }, function (err, user) {
          expect(user.email).to.be.equal("sam@test.com");
          done();
        });
      });
    });

    it("returns not found with wrong password", function (done) {
      new User({
        email: "sam@test.com",
        password: "password"
      }).register(function (err, user) {
        User.findByEmailAndPassword({
          email: "sam@test.com",
          password: "password1"
        }, function (err, user) {
          expect(err.message).to.be.equal("User not found.");
          expect(err.status).to.be.equal(404);
          done();
        });
      });
    });

    it("returns not found with wrong email", function (done) {
      new User({
        email: "sam@test.com",
        password: "password"
      }).register(function (err, user) {
        User.findByEmailAndPassword({
          email: "sam1@test.com",
          password: "password"
        }, function (err, user) {
          expect(err.message).to.be.equal("User not found.");
          expect(err.status).to.be.equal(404);
          done();
        });
      });
    });
  });

  describe(".remove", function () {
    it("deletes user", function (done) {
      new User({
        email: "sam@test.com",
        password: "password"
      }).register(function (err, user) {
        user.remove(function (err, count) {
          expect(count).to.be.eql(1);
          done();
        });
      });
    });
  });
});
