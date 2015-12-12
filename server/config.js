var env = process.env;

module.exports = {
  app: {
    environment: env.NODE_ENV || "development",
    port: env.PORT
  },

  redis: {
    url: env.REDISCLOUD_URL ? env.REDISCLOUD_URL : "localhost:6379"
  },

  mongodb: {
    url: env.MONGOLAB_URI ? env.MONGOLAB_URI : "mongodb://localhost:27017/",
    setting: env.MONGOLAB_URI ? { w : 1} : { safe: true },
    dbName: env.MONGOLAB_URI ? "" : env.DBNAME || "quiz-world"
  }
};
