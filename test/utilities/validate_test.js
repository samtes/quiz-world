var expect = require("chai").expect;
var validate;

describe("Validate user utilities",  function () {
  before(function (done) {
    validate = require("../../lib/utilities/validate");
    done();
  });

  describe("passwordMatch", function () {
    it("returns true", function (done) {
      var isValid = validate.passwordMatch("password", "password");

      expect(isValid).to.be.true;
      done();
    });

    it("returns false", function (done) {
      var isValid = validate.passwordMatch("password1", "password");

      expect(isValid).to.be.false;
      done();
    });
  });

  describe("validateEmail", function () {
    it("returns true", function (done) {
      var isValid = validate.validateEmail("sam@test.com");

      expect(isValid).to.be.true;
      done();
    });

    it("returns false for '@' missing", function (done) {
      var isValid = validate.validateEmail("samtest.com");

      expect(isValid).to.be.false;
      done();
    });

    it("returns false for '.' missing", function (done) {
      var isValid = validate.validateEmail("sam@testcom");

      expect(isValid).to.be.false;
      done();
    });
  });

  describe("verifyPassword", function () {
    it("returns true", function (done) {
      var isValid = validate.verifyPassword("Password1");

      expect(isValid).to.be.true;
      done();
    });

    it("returns false for less than 6 characters", function (done) {
      var isValid = validate.verifyPassword("passwor");

      expect(isValid).to.be.false;
      done();
    });

    it("returns false for missing lowercase", function (done) {
      var isValid = validate.verifyPassword("PASSWORD1");

      expect(isValid).to.be.false;
      done();
    });

    it("returns false for missing uppercase", function (done) {
      var isValid = validate.verifyPassword("password1");

      expect(isValid).to.be.false;
      done();
    });

    it("returns false for missing number", function (done) {
      var isValid = validate.verifyPassword("password");

      expect(isValid).to.be.false;
      done();
    });
  });
});
