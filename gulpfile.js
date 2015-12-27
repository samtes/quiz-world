var gulp = require("gulp");
var mocha = require("gulp-mocha");
var gutil = require("gulp-util");
var exit = require("gulp-exit");

gulp.task("mocha", function () {
    return gulp.src(["test/*/*.js"], { read: false })
        .pipe(mocha({
          ui: "bdd",
          growl: true,
          timeout: 2000,
          useColors: true,
          useInlineDiffs: true
         }))
});

gulp.task("watch-mocha", function () {
    gulp.watch(["lib/*/*", "test/*/*.js"], ["mocha"]);
});
