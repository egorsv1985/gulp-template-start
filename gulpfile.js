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
const imagemin = require("gulp-imagemin");
const changed = require("gulp-changed");

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
        // Если useBootstrap равно true, добавляем путь для импорта Bootstrap
        includePaths: useBootstrap ? ["./node_modules/bootstrap/scss"] : [],
      })
    )
    .pipe(gulpIf(isProduction, csso())) // Минификация только в режиме production
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(dest + "css/"));
}

// Images tasks
function imagesTask(dest) {
  return gulp
    .src(paths.src.images)
    .pipe(gulpIf(isProduction, webp())) // Обрабатываем изображения только в режиме production
    .pipe(gulpIf(isProduction, imagemin({ verbose: true }))) // Обрабатываем изображения только в режиме production
    .pipe(gulp.dest(dest + "img/"));
}

// Fonts tasks
function copyFontsTask() {
  return gulp.src(paths.src.fonts).pipe(gulp.dest(paths.dest.dev + "fonts/"));
}

function fontsConvertTask() {
  // Выполняем конвертацию шрифтов только в режиме разработки
  if (!isProduction) {
    return gulp
      .src(paths.src.fonts + "*.ttf") // Исправили путь к файлам шрифтов
      .pipe(fontmin({ formats: ["woff2"] }))
      .pipe(gulp.dest(paths.dest.dev + "fonts/"))
      .pipe(ttf2woff2())
      .pipe(gulp.dest(paths.dest.dev + "fonts/"))
      .pipe(gulp.dest("src/scss/fonts")); // Исправили путь к папке src/scss/fonts
  } else {
    return Promise.resolve(); // Возвращаем resolved Promise, чтобы в режиме production задача завершилась без ошибки
  }
}

// Задача для создания файла с подключением сконвертированных шрифтов
// function fontsStyleTask(done) {
//   // Получаем список сконвертированных шрифтов
//   const convertedFonts = fs.readdirSync(paths.dest.dev + "fonts/");

//   // Если шрифты не сконвертированы, то ничего не делаем
//   if (convertedFonts.length === 0) {
//     done();
//     return;
//   }

//   const fontsFile = `${paths.src.sass}/fonts.scss`;
//   let fontsData = "";

//   // Формируем содержимое файла fonts.scss
//   convertedFonts.forEach((file) => {
//     const fontName = file.split(".")[0];
//     const fontWeight = fontName.split("-")[1] || "400";
//     fontsData += `@font-face {
//   font-family: "${fontName}";
//   font-display: swap;
//   src: url("../fonts/${fontName}.woff2") format("woff2"), url("../fonts/${fontName}.woff") format("woff");
//   font-weight: ${fontWeight};
//   font-style: normal;
// }\n`;
//   });

//   if (fontsData.length > 0) {
//     fs.writeFileSync(fontsFile, fontsData, "utf8");
//   } else {
//     // Если шрифтов нет, удаляем файл fonts.scss, если он существует
//     if (fs.existsSync(fontsFile)) {
//       fs.unlinkSync(fontsFile);
//     }
//   }

//   done();
// }

// Files task
function filesTask(dest) {
  return gulp.src(paths.src.files).pipe(gulp.dest(dest + "files/"));
}

// Scripts tasks
function scriptsTask(dest) {
  return gulp
    .src(paths.src.scripts)
    .pipe(plumber(plumberNotify("JS")))
    .pipe(
      webpack({
        // Настройки webpack
        mode: isProduction ? "production" : "development",
        output: {
          filename: "[name].js",
        },
        devtool: isProduction ? "source-map" : "eval-cheap-module-source-map",
        module: {
          rules: [
            {
              test: /\.js$/,
              exclude: /node_modules/,
              use: {
                loader: "babel-loader",
                options: {
                  presets: ["@babel/preset-env"],
                },
              },
            },
          ],
        },
      })
    )
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
  gulp.watch(paths.src.html, gulp.series(htmlTask.bind(null, paths.dest.dev)));
  gulp.watch(paths.src.sass, gulp.series(sassTask.bind(null, paths.dest.dev)));
  gulp.watch(
    paths.src.images,
    gulp.series(imagesTask.bind(null, paths.dest.dev))
  );
  // gulp.watch(paths.src.fonts, gulp.series(copyFontsTask));
  gulp.watch(
    paths.src.files,
    gulp.series(filesTask.bind(null, paths.dest.dev))
  );
  gulp.watch(
    paths.src.scripts,
    gulp.series(scriptsTask.bind(null, paths.dest.dev))
  );
}

// Default task
gulp.task(
  "default",
  gulp.series(
    gulp.parallel(
      cleanTask.bind(null, paths.dest.dev),
      cleanTask.bind(null, paths.dest.docs)
    ),
    gulp.parallel(
      htmlTask.bind(null, paths.dest.dev),
      sassTask.bind(null, paths.dest.dev),
      imagesTask.bind(null, paths.dest.dev),
      // gulp.series(copyFontsTask, fontsConvertTask, fontsStyleTask), // Перемещаем fontsConvertTask в середину цепочки задач
      filesTask.bind(null, paths.dest.dev),
      scriptsTask.bind(null, paths.dest.dev)
    ),
    serverTask.bind(null, paths.dest.dev),
    watchTask
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
      // fontsConvertTask, // Выполняем конвертацию шрифтов в режиме разработки
      // gulp.series(copyFontsTask, fontsStyleTask), // Создаем файл со стилями после конвертации шрифтов
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
      // fontsConvertTask, // Выполняем конвертацию шрифтов в режиме разработки (в production это не создаст файлов)
      // gulp.series(copyFontsTask, fontsStyleTask), // Создаем файл со стилями после конвертации шрифтов
      filesTask.bind(null, paths.dest.docs),
      scriptsTask.bind(null, paths.dest.docs)
    )
  )
);
