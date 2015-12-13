var port = process.env.PORT || 3000;
var express = require("express");
var path = require("path");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var session = require("express-session");

var config = require("./server/config");
// var validateSession = require("./server/validate-session")

var users = require("./routes/users");
var register = require("./routes/register");
var authenticate = require("./routes/authenticate");

var app = express();
var RedisStore = require("connect-redis")(session);

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  store: new RedisStore({
    url: config.redis.url
  }),
  secret: "change-this-to-a-super-secret-message",
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));


app.use("/register", register);
app.use("/login", authenticate);

// app.use(validateSession);

app.use("/users", users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error("Route not found");
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get("env") === "development") {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send({
    message: err.message,
    error: {}
  });
});

var server = require("http").createServer(app);
server.listen(port, function () {
  console.log("Node server listening. Port: ".concat(port));
});

module.exports = app;
