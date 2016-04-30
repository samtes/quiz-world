var error = require("./error");

module.exports = function (req, res, next){
  if (req.method.toLowerCase() === "options") {
    var allowHeaders = ["Accept", "Accept-Version", "Origin", "X-Requested-With", "Authorization", "Content-Type", "Content-Length", "Session-id"];
    if (!res.methods) {
      res.methods = [];
    }

    if (res.methods.indexOf("OPTIONS") === -1) {
      res.methods.push("OPTIONS");
    }

    if (res.methods.indexOf("DELETE") === -1) {
      res.methods.push("DELETE");
    }

    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Headers", allowHeaders.join(", "));
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Origin", "*");

    res.status(204).send();
  } else {
    next();
  }
}
