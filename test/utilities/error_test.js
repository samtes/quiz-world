var expect = require("chai").expect;
var error;

describe("Error",  function () {
  before(function (done) {
    error = require("../../lib/utilities/error");
    done();
  });

  describe("notFound", function () {
    it("returns 404", function (done) {
      var err = error.notFound("This is a 404 error.");

      expect(err.status).to.be.equal(404);
      expect(err.message).to.be.equal("This is a 404 error.");
      done();
    });
  });

  describe("notCreated", function () {
    it("returns 422", function (done) {
      var err = error.notCreated("This is a 422 error.");

      expect(err.status).to.be.equal(422);
      expect(err.message).to.be.equal("This is a 422 error.");
      done();
    });
  });

  describe("badRequest", function () {
    it("returns 400", function (done) {
      var err = error.badRequest("This is a 400 error.");

      expect(err.status).to.be.equal(400);
      expect(err.message).to.be.equal("This is a 400 error.");
      done();
    });
  });

  describe("unauthorized", function () {
    it("returns 401", function (done) {
      var err = error.unauthorized("This is a 401 error.");

      expect(err.status).to.be.equal(401);
      expect(err.message).to.be.equal("This is a 401 error.");
      done();
    });
  });

  describe("serverError", function () {
    it("returns 500", function (done) {
      var err = error.serverError("This is a 500 error.");

      expect(err.status).to.be.equal(500);
      expect(err.message).to.be.equal("This is a 500 error.");
      done();
    });
  });
});
