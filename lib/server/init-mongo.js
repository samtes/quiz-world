var config = require("./config");
var mongoskin = require("mongoskin").db(config.mongodb.url.concat(config.mongodb.dbName), config.mongodb.setting);

exports.db = mongoskin;
