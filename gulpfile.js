const gulp = require("gulp");
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
const webpack = require("webpack-stream");
const babel = require("gulp-babel");
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const gulpIf = require("gulp-if");
const insert = require("gulp-insert");

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
    html: ["./src/**/*.html", "!./src/html/components/*.html"],
    sass: "./src/scss/**/*.scss",
    images: "./src/img/**/*.*",
    fonts: "./src/fonts/**/*.*",
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
    .pipe(sass({
      // Если useBootstrap равно true, добавляем путь для импорта Bootstrap
      includePaths: useBootstrap ? ["./node_modules/bootstrap/scss"] : []
    }))
    .pipe(csso())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(dest+ "css/"));
}


// Images tasks
function imagesTask(dest) {
  return gulp
    .src(paths.src.images)
    .pipe(webp())
    .pipe(gulp.dest(dest + "img/"))
    .pipe(gulp.src(paths.src.images))
    .pipe(imagemin({ verbose: true }))
    .pipe(gulp.dest(dest + "img/"));
}

// Fonts tasks
function fontsTask(dest) {
  return gulp.src(paths.src.fonts).pipe(gulp.dest(dest + "fonts/"));
}

// Files tasks
function filesTask(dest) {
  return gulp.src(paths.src.files).pipe(gulp.dest(dest + "files/"));
}

// Scripts tasks
function scriptsTask(dest) {
  return gulp
    .src(paths.src.scripts)
    .pipe(plumber(plumberNotify("JS")))
    .pipe(babel())
    .pipe(webpack(require("./webpack.config")))
    .pipe(gulp.dest(dest + "js"));
}

// Server tasks
function serverTask(dest) {
  return gulp.src(dest).pipe(
    server({
      livereload: true,
      open: true,
      port: 3000,
    })
  );
}

// Clean tasks
function cleanTask(dest) {
  return fs.existsSync(dest)
    ? gulp.src(dest, { read: false }).pipe(clean({ force: true }))
    : Promise.resolve();
}

// Watch task
function watchTask() {
  gulp.watch(paths.src.sass, sassTask.bind(null, paths.dest.dev));
  gulp.watch(paths.src.html, htmlTask.bind(null, paths.dest.dev));
  gulp.watch(paths.src.images, imagesTask.bind(null, paths.dest.dev));
  gulp.watch(paths.src.fonts, fontsTask.bind(null, paths.dest.dev));
  gulp.watch(paths.src.files, filesTask.bind(null, paths.dest.dev));
  gulp.watch(paths.src.scripts, scriptsTask.bind(null, paths.dest.dev));
}

// Default task
gulp.task("default", gulp.series(
  gulp.parallel(
    cleanTask.bind(null, paths.dest.dev),
    cleanTask.bind(null, paths.dest.docs)
  ),
  gulp.parallel(
    htmlTask.bind(null, paths.dest.dev),
    sassTask.bind(null, paths.dest.dev),
    imagesTask.bind(null, paths.dest.dev),
    fontsTask.bind(null, paths.dest.dev),
    filesTask.bind(null, paths.dest.dev),
    scriptsTask.bind(null, paths.dest.dev)
  ),
  serverTask.bind(null, paths.dest.dev),
  watchTask
));

// Docs task
gulp.task("docs", gulp.series(
  cleanTask.bind(null, paths.dest.docs),
  gulp.parallel(
    htmlTask.bind(null, paths.dest.docs),
    sassTask.bind(null, paths.dest.docs),
    imagesTask.bind(null, paths.dest.docs),
    fontsTask.bind(null, paths.dest.docs),
    filesTask.bind(null, paths.dest.docs),
    scriptsTask.bind(null, paths.dest.docs)
  )
));
