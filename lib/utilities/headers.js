module.exports = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
	res.header("Access-Control-Allow-Headers", "Origin, Authorization, X-Requested-With, Content-Type, Accept, Accept-Version, Content-Length, Api-Version Session-id");
  res.header("Access-Control-Allow-Resource", "*");
	res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  next();
}
