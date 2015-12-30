var expect = require("chai").expect;
var validate;

describe("Validate",  function () {
  before(function (done) {
    validate = require("../../lib/utilities/validate");
    done();
  });

  describe("passwordMatch", function () {
    it("returns true", function () {
      var isValid = validate.passwordMatch("password", "password");

      expect(isValid).to.be.true;
    });

    it("returns false", function () {
      var isValid = validate.passwordMatch("password1", "password");

      expect(isValid).to.be.false;
    });
  });

  describe("validateEmail", function () {
    it("returns true", function () {
      var isValid = validate.validateEmail("sam@test.com");

      expect(isValid).to.be.true;
    });

    it("returns false for '@' missing", function () {
      var isValid = validate.validateEmail("samtest.com");

      expect(isValid).to.be.false;
    });

    it("returns false for '.' missing", function () {
      var isValid = validate.validateEmail("sam@testcom");

      expect(isValid).to.be.false;
    });
  });

  describe("verifyPassword", function () {
    it("returns true", function () {
      var isValid = validate.verifyPassword("Password1");

      expect(isValid).to.be.true;
    });

    it("returns false for less than 6 characters", function () {
      var isValid = validate.verifyPassword("passwor");

      expect(isValid).to.be.false;
    });

    it("returns false for missing lowercase", function () {
      var isValid = validate.verifyPassword("PASSWORD1");

      expect(isValid).to.be.false;
    });

    it("returns false for missing uppercase", function () {
      var isValid = validate.verifyPassword("password1");

      expect(isValid).to.be.false;
    });

    it("returns false for missing number", function () {
      var isValid = validate.verifyPassword("password");

      expect(isValid).to.be.false;
    });
  });

  describe("verifyMongoId", function () {
    it("returns false", function () {
      var isMongoId = validate.verifyMongoId("not_a_mongoId");

      expect(isMongoId).to.be.false;
    });

    it("returns true", function () {
      var isMongoId = validate.verifyMongoId("1234ABCDabcd1234ABCDabcd");

      expect(isMongoId).to.be.true;
    });
  });
});
