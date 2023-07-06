const gulp = require("gulp");
const fileInclude = require("gulp-file-include");
const sass = require("gulp-sass")(require("sass"));
const server = require("gulp-server-livereload");
const clean = require("gulp-clean");
const fs = require("fs");
const sourcemaps = require("gulp-sourcemaps");
const groupMedia = require("gulp-group-css-media-queries");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const path = require("path");

const fileIncludeSettings = {
  prefix: "@@",
  basepath: "@file",
};

const plumberConfig = {
  errorHandler: function (error) {
    const format = path
      .extname(error.relativePath)
      .toUpperCase()
      .replace(".", "");
    notify.onError({
      title: "Error - " + format,
      message: "<%= error.message %>",
      sound: false,
    })(error);
    this.emit("end"); // Продолжаем выполнение задачи Gulp после ошибки
  },
};

gulp.task("html", function () {
  return gulp
    .src("./src/html/pages/*.html")
    .pipe(fileInclude({ fileIncludeSettings }))
    .pipe(gulp.dest("./dist/"))
    .pipe(plumber(plumberConfig)); // Плагин plumber для обработки ошибок внутри pipe
});

gulp.task("sass", function () {
  return gulp
    .src("./src/scss/**/*.scss")
    .pipe(plumber(plumberConfig)) // Плагин plumber для обработки ошибок
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(groupMedia())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("./dist/css/"));
});

gulp.task("images", function () {
  return gulp.src("./src/img/**/*.*").pipe(gulp.dest("./dist/img/"));
});

gulp.task("fonts", function () {
	return gulp.src("./src/fonts/**/*.*").pipe(gulp.dest("./dist/fonts/"));
  });
  gulp.task("files", function () {
	return gulp.src("./src/files/**/*.*").pipe(gulp.dest("./dist/files/"));
  });
gulp.task("server", function () {
  return gulp.src("./dist/").pipe(
    server({
      livereload: true,
      open: true,
    })
  );
});

gulp.task("clean", function (cb) {
  if (fs.existsSync("./dist")) {
    return gulp.src("./dist/", { read: false }).pipe(clean({ force: true }));
  }
  cb();
});

gulp.task("watch", function () {
  gulp.watch("./src/scss/**/*.scss", gulp.parallel("sass"));
  gulp.watch("./src/html/**/*.html", gulp.parallel("html"));
  gulp.watch("./src/img/**/*", gulp.parallel("images"));
  gulp.watch("./src/fonts/**/*", gulp.parallel("fonts"));
  gulp.watch("./src/files/**/*", gulp.parallel("files"));
});

gulp.task(
  "default",
  gulp.series(
    "clean",
    gulp.parallel("html", "sass", "images", 'fonts', 'files'),
    gulp.parallel("watch", "server")
  )
);
