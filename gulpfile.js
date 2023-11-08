const gulp = require("gulp");
// HTML и шаблоны
const fileInclude = require("gulp-file-include"); // Позволяет включать содержимое одного файла в другой.
const webpHTML = require("gulp-webp-html"); // Преобразует изображения в формате WebP для использования в HTML.

// CSS
const sass = require("gulp-sass")(require("sass")); // Компилирует файлы SASS в CSS.
const sassGlob = require("gulp-sass-glob"); // Позволяет использовать глобальные шаблоны при компиляции SASS.
const groupMedia = require("gulp-group-css-media-queries"); // Группирует медиа-запросы в CSS.
const autoprefixer = require("gulp-autoprefixer"); // Добавляет вендорные префиксы к CSS.
const csso = require("gulp-csso"); // Минифицирует CSS-код.
const webpCss = require("gulp-webp-css"); // Заменяет ссылки на изображения на их эквиваленты в формате WebP в CSS.

// JavaScript
const babel = require("gulp-babel"); // Транспилирует современный JavaScript в более старый синтаксис для обеспечения кросс-браузерной совместимости.

// Изображения
// const webp = require("gulp-webp"); // Конвертирует изображения в формате WebP.
const imagemin = require("gulp-imagemin"); // Сжимает изображения.
const changed = require("gulp-changed"); // Позволяет сжимать только изменившиеся изображения.

// Общие операции
const server = require("gulp-server-livereload"); // Запускает локальный сервер с поддержкой автоматической перезагрузки при изменении файлов.
const clean = require("gulp-clean"); // Удаляет файлы и папки.
const fs = require("fs"); // Модуль Node.js для работы с файловой системой.
const sourcemaps = require("gulp-sourcemaps"); // Создает карты источников для CSS и JavaScript.
const plumber = require("gulp-plumber"); // Предотвращает прерывание выполнения задач Gulp при ошибках.
const notify = require("gulp-notify"); // Отправляет уведомления о результатах выполнения задач Gulp.
const gulpIf = require("gulp-if"); // Позволяет выполнять задачи Gulp на основе условий.
const watch = require("gulp-watch"); // Отслеживает изменения файлов и запускает задачи Gulp при их изменении.

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
