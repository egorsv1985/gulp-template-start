const gulp = require("gulp");
const fileInclude = require("gulp-file-include");
const sass = require("gulp-sass")(require("sass"));
const server = require("gulp-server-livereload");
const clean = require("gulp-clean");
const fs = require("fs");
const sourceMaps = require("gulp-sourcemaps");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const webpack = require("webpack-stream");
const changed = require("gulp-changed");
const sassGlob = require("gulp-sass-glob");
const gulpIf = require("gulp-if");
const groupMedia = require("gulp-group-css-media-queries");
const babel = require("gulp-babel");
const imagemin = require("gulp-imagemin");
const autoprefixer = require("gulp-autoprefixer");
const csso = require("gulp-csso");
const htmlclean = require("gulp-htmlclean");
const webp = require("gulp-webp");
const webpHTML = require("gulp-webp-html");
const webpCss = require("gulp-webp-css");

// Constants
const isDocs = process.env.NODE_ENV === "docs";
const fileIncludeSettings = {
  prefix: "@@",
  basepath: "@file",
};
const paths = {
  src: {
    html: ["./src/html/**/*.html", "!./src/html/components/*.html"],
    scss: "./src/scss/**/*.scss",
    img: "./src/img/**/*",
    fonts: "./src/fonts/**/*",
    files: "./src/files/**/*",
    js: "./src/js/*.js",
  },
  dest: {
    dev: "./build/",
    docs: "./docs/",
  },
};
const webpackConfig = require("./webpack.config.js");
const sassOptions = {
  includePaths: ["./node_modules"],
};
const autoprefixerOptions = {
  grid: true,
  overrideBrowserslist: ["last 10 versions"],
  cascade: true,
};
const serverOptions = {
  livereload: true,
  open: true,
};
// Function to handle plumber errors
const plumberNotify = (title) => {
  return {
    errorHandler: notify.onError({
      title: title,
      message: "Error <%= error.message %>",
      sound: false,
    }),
  };
};
// Helper function for clean task
const cleanTask = function (done) {
  const destination = isDocs ? paths.dest.docs : paths.dest.dev;
  if (fs.existsSync(destination)) {
    return gulp.src(destination, { read: false }).pipe(clean({ force: true }));
  }
  done();
};

// HTML Task
gulp.task("html", function () {
  const destination = isDocs ? paths.dest.docs : paths.dest.dev;
  return gulp
    .src(paths.src.html)
    .pipe(changed(destination))
    .pipe(plumber(plumberNotify("HTML")))
    .pipe(fileInclude(fileIncludeSettings))
    .pipe(gulpIf(isDocs, webpHTML()))
    .pipe(gulpIf(isDocs, htmlclean()))
    .pipe(gulp.dest(destination));
});

// Styles Task
gulp.task("sass", function () {
  const destination = isDocs
    ? paths.dest.docs + "css/"
    : paths.dest.dev + "css/";
  return gulp
    .src(paths.src.scss)
    .pipe(changed(destination))
    .pipe(plumber(plumberNotify("SCSS")))
    .pipe(sourceMaps.init())
    .pipe(gulpIf(isDocs, autoprefixer(autoprefixerOptions)))
    .pipe(sassGlob())
    .pipe(gulpIf(isDocs, webpCss()))
    .pipe(gulpIf(isDocs, groupMedia()))
    .pipe(sass(sassOptions))
    .pipe(gulpIf(isDocs, csso()))
    .pipe(sourceMaps.write())
    .pipe(gulp.dest(destination));
});

// Images Task
gulp.task("images", function () {
  const destination = isDocs
    ? paths.dest.docs + "img/"
    : paths.dest.dev + "img/";
  return gulp
    .src(paths.src.img)
    .pipe(changed(destination))
    .pipe(gulpIf(isDocs, webp()))
    .pipe(gulp.dest(destination))
    .pipe(gulp.src(paths.src.img))
    .pipe(gulp.dest(destination))
    .pipe(gulpIf(isDocs, imagemin({ verbose: true })))
    .pipe(gulp.dest(destination));
});

// Fonts Task
gulp.task("fonts", function () {
  const destination = isDocs
    ? paths.dest.docs + "fonts/"
    : paths.dest.dev + "fonts/";
  return gulp
    .src(paths.src.fonts)
    .pipe(changed(destination))
    .pipe(gulp.dest(destination));
});

// Files Task
gulp.task("files", function () {
  const destination = isDocs
    ? paths.dest.docs + "files/"
    : paths.dest.dev + "files/";
  return gulp
    .src(paths.src.files)
    .pipe(changed(destination))
    .pipe(gulp.dest(destination));
});

// JavaScript Task
gulp.task("js", function () {
  const destination = isDocs ? paths.dest.docs + "js/" : paths.dest.dev + "js/";
  return gulp
    .src(paths.src.js)
    .pipe(changed(destination))
    .pipe(plumber(plumberNotify("JS")))
    .pipe(webpack(webpackConfig))
    .pipe(babel())
    .pipe(gulp.dest(destination));
});

// Server Task
gulp.task("server", function () {
  const destination = isDocs ? paths.dest.docs : paths.dest.dev;
  return gulp.src(destination).pipe(server(serverOptions));
});

// Watch Task
gulp.task("watch", function () {
  gulp.watch(paths.src.scss, gulp.parallel("sass"));
  gulp.watch(paths.src.html, gulp.parallel("html"));
  gulp.watch(paths.src.img, gulp.parallel("images"));
  gulp.watch(paths.src.fonts, gulp.parallel("fonts"));
  gulp.watch(paths.src.files, gulp.parallel("files"));
  gulp.watch(paths.src.js, gulp.parallel("js"));
});

// Build Task
gulp.task(
  "build",
  gulp.series(
    cleanTask,
    gulp.parallel("html", "sass", "images", "fonts", "files", "js")
  )
);

// Default Task
gulp.task("default", gulp.series("build", gulp.parallel("server", "watch")));
