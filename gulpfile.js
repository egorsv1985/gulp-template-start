const gulp = require("gulp");
const webp = require("gulp-webp");
const fileInclude = require("gulp-file-include");
const webpHTML = require("gulp-webp-html");
const sass = require("gulp-sass")(require("sass"));
const sassGlob = require("gulp-sass-glob");
const server = require("gulp-server-livereload");
const clean = require("gulp-clean");
const fs = require("fs");
const sourcemaps = require("gulp-sourcemaps");
const groupMedia = require("gulp-group-css-media-queries");
const autoprefixer = require("gulp-autoprefixer");
const csso = require("gulp-csso");
const webpCss = require("gulp-webp-css");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const imagemin = require("gulp-imagemin");
const changed = require("gulp-changed");
const gulpIf = require("gulp-if");
const babel = require("gulp-babel");
const watch = require("gulp-watch");

const fileIncludeSettings = {
  prefix: "@@",
  basepath: "@file",
};

const plumberNotify = (title) => {
  return {
    errorHandler: notify.onError({
      title: title,
      message: "Error <%= error.message %>",
      sound: false,
    }),
  };
};

const paths = {
  src: {
    html: ["./src/**/*.html"],
    sass: "./src/scss/**/*.scss",
    images: "./src/img/**/*.*",
    files: "./src/files/**/*.*",
    scripts: "./src/js/**/*.js",
  },
  dest: {
    dev: "./build/",
    docs: "./docs/",
  },
};

const isProduction = process.env.NODE_ENV === "production";
const usePug = false; // Установите в true, чтобы использовать Pug
const useBootstrap = true; // Установите в false, чтобы не подключать Bootstrap. По умолчанию будет включено.

// HTML tasks
function htmlTask(dest) {
  return gulp
    .src(paths.src.html)
    .pipe(plumber(plumberNotify("HTML")))
    .pipe(fileInclude({ fileIncludeSettings }))
    .pipe(webpHTML())
    .pipe(gulp.dest(dest));
}

// SASS tasks
function sassTask(dest) {
  return gulp
    .src(paths.src.sass)
    .pipe(plumber(plumberNotify("SASS")))
    .pipe(sourcemaps.init())
    .pipe(autoprefixer())
    .pipe(sassGlob())
    .pipe(webpCss())
    .pipe(groupMedia())
    .pipe(
      sass({
        includePaths: useBootstrap ? ["./node_modules/bootstrap/scss"] : [],
      })
    )
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(dest + "css/"));
}

// Images tasks
function imagesTask(dest) {
  return gulp
    .src(paths.src.images)
    .pipe(gulpIf(isProduction, webp()))
    .pipe(gulpIf(isProduction, imagemin({ verbose: true })))
    .pipe(gulp.dest(dest + "img/"));
}

// Files task
function filesTask(dest) {
  return gulp.src(paths.src.files).pipe(gulp.dest(dest + "files/"));
}

// Scripts tasks
function scriptsTask(dest) {
  return gulp
    .src(paths.src.scripts)
    .pipe(plumber(plumberNotify("JS")))
    .pipe(sourcemaps.init())
    .pipe(babel({ presets: ["@babel/preset-env"] }))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(dest + "js/"));
}

// Clean task
function cleanTask(dest) {
  return gulp.src(dest, { allowEmpty: true, read: false }).pipe(clean());
}

// Server task
function serverTask(dest) {
  return gulp.src(dest).pipe(
    server({
      livereload: true,
      open: true,
    })
  );
}

// Watch task

function watchTask() {
  watch("./src/**/*.html", gulp.series(htmlTask.bind(null, paths.dest.dev)));
  watch(paths.src.sass, gulp.series(sassTask.bind(null, paths.dest.dev)));
  watch(paths.src.images, gulp.series(imagesTask.bind(null, paths.dest.dev)));
  watch(paths.src.files, gulp.series(filesTask.bind(null, paths.dest.dev)));
  watch(paths.src.scripts, gulp.series(scriptsTask.bind(null, paths.dest.dev)));
}

// Default task
gulp.task(
  "default",
  gulp.series(
    cleanTask.bind(null, paths.dest.dev),
    gulp.parallel(
      htmlTask.bind(null, paths.dest.dev),
      sassTask.bind(null, paths.dest.dev),
      imagesTask.bind(null, paths.dest.dev),
      filesTask.bind(null, paths.dest.dev),
      scriptsTask.bind(null, paths.dest.dev)
    ),
    serverTask.bind(null, paths.dest.dev),
    watchTask
  )
);

// Build task
gulp.task(
  "build",
  gulp.series(
    cleanTask.bind(null, paths.dest.docs),
    gulp.parallel(
      htmlTask.bind(null, paths.dest.docs),
      sassTask.bind(null, paths.dest.docs),
      imagesTask.bind(null, paths.dest.docs),
      filesTask.bind(null, paths.dest.docs),
      scriptsTask.bind(null, paths.dest.docs)
    )
  )
);

// Dev task
gulp.task(
  "dev",
  gulp.series(
    cleanTask.bind(null, paths.dest.dev),
    gulp.parallel(
      htmlTask.bind(null, paths.dest.dev),
      sassTask.bind(null, paths.dest.dev),
      imagesTask.bind(null, paths.dest.dev),
      filesTask.bind(null, paths.dest.dev),
      scriptsTask.bind(null, paths.dest.dev)
    ),
    serverTask.bind(null, paths.dest.dev),
    watchTask
  )
);
