const gulp = require("gulp");
const gulpif = require("gulp-if");
const fileInclude = require("gulp-file-include");
const sass = require("gulp-sass")(require("sass"));
const server = require("gulp-server-livereload");
const clean = require("gulp-clean");
const fs = require("fs");
const sourceMaps = require("gulp-sourcemaps");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const webpack = require("webpack-stream");
const babel = require("gulp-babel");
const imagemin = require("gulp-imagemin");
const changed = require("gulp-changed");
const sassGlob = require("gulp-sass-glob");
const autoprefixer = require("gulp-autoprefixer");
const csso = require("gulp-csso");
const htmlclean = require("gulp-htmlclean");
const webp = require("gulp-webp");
const webpHTML = require("gulp-webp-html");
const webpCss = require("gulp-webp-css");
const groupMedia = require("gulp-group-css-media-queries");

// Paths
const paths = {
  src: {
    html: "./src/html/**/*.html",
    scss: "./src/scss/*.scss",
    img: "./src/img/**/*",
    fonts: "./src/fonts/**/*",
    files: "./src/files/**/*",
    js: "./src/js/*.js",
  },
  dest: {
    dev: "./build/",
    build: "./docs/",
  },
};

// Server Options
const serverOptions = {
  livereload: true,
  open: true,
};

// Plumber Notify
const plumberNotify = (title) => {
  return {
    errorHandler: notify.onError({
      title: title,
      message: "Error <%= error.message %>",
      sound: false,
    }),
  };
};

// Autoprefixer Options
const autoprefixerOptions = {
  grid: true,
  overrideBrowserslist: ["last 10 versions"],
  cascade: true,
};

// Webp Options
const webpOptions = {
  verbose: true,
};

// Gulp task for cleaning
const cleanTask = function (done) {
  const targetDir = isDev ? paths.dest.dev : paths.dest.build;
  if (fs.existsSync(targetDir)) {
    return gulp.src(targetDir, { read: false }).pipe(clean({ force: true }));
  }
  done();
};

// Gulp task for HTML
const htmlTask = function () {
  return gulp
    .src([paths.src.html, `!${paths.src.html}/components/*.html`])
    .pipe(changed(isDev ? paths.dest.dev : paths.dest.build))
    .pipe(plumber(plumberNotify("HTML")))
    .pipe(fileInclude(fileIncludeSettings))
    .pipe(gulpif(!isDev, webpHTML()))
    .pipe(gulpif(!isDev, htmlclean()))
    .pipe(gulp.dest(isDev ? paths.dest.dev : paths.dest.build));
};

// Gulp task for SASS
const sassTask = function () {
  return gulp
    .src(paths.src.scss)
    .pipe(changed(isDev ? paths.dest.dev + "css/" : paths.dest.build + "css/"))
    .pipe(plumber(plumberNotify("SCSS")))
    .pipe(sourceMaps.init())
    .pipe(gulpif(!isDev, autoprefixer(autoprefixerOptions)))
    .pipe(gulpif(!isDev, webpCss()))
    .pipe(gulpif(!isDev, groupMedia()))
    .pipe(sass())
    .pipe(gulpif(!isDev, csso()))
    .pipe(sourceMaps.write())
    .pipe(
      gulp.dest(isDev ? paths.dest.dev + "css/" : paths.dest.build + "css/")
    );
};

// Gulp task for Images
const imagesTask = function () {
  return gulp
    .src(paths.src.img)
    .pipe(changed(isDev ? paths.dest.dev + "img/" : paths.dest.build + "img/"))
    .pipe(gulpif(!isDev, webp(webpOptions)))
    .pipe(
      gulp.dest(isDev ? paths.dest.dev + "img/" : paths.dest.build + "img/")
    )
    .pipe(gulp.src(paths.src.img))
    .pipe(
      gulp.dest(isDev ? paths.dest.dev + "img/" : paths.dest.build + "img/")
    )
    .pipe(gulpif(!isDev, imagemin({ verbose: true })))
    .pipe(
      gulp.dest(isDev ? paths.dest.dev + "img/" : paths.dest.build + "img/")
    );
};

// Gulp task for Fonts
const fontsTask = function () {
  return gulp
    .src(paths.src.fonts)
    .pipe(
      changed(isDev ? paths.dest.dev + "fonts/" : paths.dest.build + "fonts/")
    )
    .pipe(
      gulp.dest(isDev ? paths.dest.dev + "fonts/" : paths.dest.build + "fonts/")
    );
};

// Gulp task for Files
const filesTask = function () {
  return gulp
    .src(paths.src.files)
    .pipe(
      changed(isDev ? paths.dest.dev + "files/" : paths.dest.build + "files/")
    )
    .pipe(
      gulp.dest(isDev ? paths.dest.dev + "files/" : paths.dest.build + "files/")
    );
};

// Gulp task for JS
const jsTask = function () {
  return gulp
    .src(paths.src.js)
    .pipe(changed(isDev ? paths.dest.dev + "js/" : paths.dest.build + "js/"))
    .pipe(plumber(plumberNotify("JS")))
    .pipe(webpack(require("../webpack.config.js")))
    .pipe(gulpif(!isDev, babel()))
    .pipe(gulp.dest(isDev ? paths.dest.dev + "js/" : paths.dest.build + "js/"));
};

// Gulp task for Server
const serverTask = function () {
  return gulp
    .src(isDev ? paths.dest.dev : paths.dest.build)
    .pipe(server(serverOptions));
};

// Gulp task for Watch
const watchTask = function () {
  gulp.watch(paths.src.scss, gulp.parallel("sass"));
  gulp.watch(paths.src.html, gulp.parallel("html"));
  gulp.watch(paths.src.img, gulp.parallel("images"));
  gulp.watch(paths.src.fonts, gulp.parallel("fonts"));
  gulp.watch(paths.src.files, gulp.parallel("files"));
  gulp.watch(paths.src.js, gulp.parallel("js"));
};

// Determine build mode based on npm script
const isDev = process.env.NODE_ENV === "development";

// File Include Settings
const fileIncludeSettings = {
  prefix: "@@",
  basepath: "@file",
};

// Default Gulp task
gulp.task(
  "default",
  gulp.series(
    cleanTask,
    gulp.parallel("html", "sass", "images", "fonts", "files", "js"),
    gulp.parallel("server", "watch")
  )
);

// Development Gulp task
gulp.task(
  "dev",
  gulp.series(
    cleanTask,
    gulp.parallel("html", "sass", "images", "fonts", "files", "js"),
    gulp.parallel("server", "watch")
  )
);

// Production Gulp task
gulp.task(
  "build",
  gulp.series(
    cleanTask,
    gulp.parallel("html", "sass", "images", "fonts", "files", "js")
  )
);
