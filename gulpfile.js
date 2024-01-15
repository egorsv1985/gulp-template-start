// Импорты модулей Gulp
import gulp from 'gulp'
import fileInclude from 'gulp-file-include'
import dartSass from 'sass'
import gulpSass from 'gulp-sass'
const sass = gulpSass(dartSass)
import clean from 'gulp-clean'
import fs from 'fs'
import sourceMaps from 'gulp-sourcemaps'
import plumber from 'gulp-plumber'
import notify from 'gulp-notify'
import changed from 'gulp-changed'
import sassGlob from 'gulp-sass-glob'
import postcss from 'gulp-postcss'
import imagemin from 'gulp-imagemin'
import webp from 'gulp-webp'
import concat from 'gulp-concat'
import browserSync from 'browser-sync'
import filter from 'gulp-filter'
import gulpIf from 'gulp-if'
import replace from 'gulp-replace'
import zip from 'gulp-zip'
import cleanCSS from 'gulp-clean-css'
import rename from 'gulp-rename'
import terser from 'gulp-terser'

// Константа, определяющая режим сборки (разработка или продакшн)
const isProduction = process.env.NODE_ENV === 'production'

// Чтение информации о проекте из package.json
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))
const projectName = packageJson.name

// Настройки для gulp-file-include
const fileIncludeSettings = {
	prefix: '@@',
	basepath: '@file',
}

// Пути к исходным файлам и папкам назначения
const paths = {
	src: {
		html: './src/html/**/*.html',
		scss: './src/scss/**/*.scss',
		images: './src/images/**/*',
		fonts: './src/fonts/**/*',
		files: './src/files/**/*',
		js: './src/js/**/*.js',
	},
	dest: {
		dev: './docs/',
	},
	img: {
		html: './images',
		css: '../images',
		js: '../images',
	},
}

// Опции для компиляции Sass
const sassOptions = {
	includePaths: ['./node_modules'],
}

// Определение путей для различных задач
const destination = paths.dest.dev
const cssDestination = destination + 'css/'
const imagesDestination = destination + 'images/'
const fontsDestination = destination + 'fonts/'
const filesDestination = destination + 'files/'
const jsDestination = destination + 'js/'

// Настройки сервера для разработки
const serverOptions = {
	server: {
		baseDir: paths.dest.dev,
	},
	port: 3000,
	open: true,
	notify: false,
}

// Настройки сервера для продакшна
const customerServerOptions = {
	server: {
		baseDir: paths.dest.dev,
	},
	port: 4000,
	open: true,
	notify: false,
}

// Функция для обработки ошибок с уведомлением
const plumberNotify = title => {
	return {
		errorHandler: notify.onError({
			title: title,
			message: 'Error <%= error.message %>',
			sound: false,
		}),
	}
}

// Задача для очистки папки dist перед сборкой
const cleanTask = done => {
	if (fs.existsSync(destination)) {
		return gulp.src(destination, { read: false }).pipe(clean({ force: true }))
	}
	done()
}

// Задача для сборки HTML
export const html = () => {
	const filterHTML = filter(['**/*.html', '!**/_*.html'], { restore: true })

	return gulp
		.src(paths.src.html)
		.pipe(changed(destination))
		.pipe(plumber(plumberNotify('HTML')))
		.pipe(fileInclude(fileIncludeSettings))
		.pipe(gulpIf(isProduction, webpHTML()))
		.pipe(replace('@img', paths.img.html))
		.pipe(filterHTML)
		.pipe(gulp.dest(destination))
		.pipe(filterHTML.restore)
		.pipe(browserSync.stream())
}

// Задача для сборки стилей
export const styles = () => {
	const filterScss = filter(['**/*', '!src/scss/**/_*.scss'], {
		restore: true,
	})

	return gulp
		.src(paths.src.scss)
		.pipe(changed(cssDestination))
		.pipe(plumber(plumberNotify('SCSS')))
		.pipe(sourceMaps.init())
		.pipe(sassGlob())
		.pipe(sass(sassOptions))
		.pipe(replace('@img', paths.img.css))
		.pipe(gulpIf(isProduction, postcss()))
		.pipe(sourceMaps.write())
		.pipe(filterScss)
		.pipe(gulp.dest(cssDestination))
		.pipe(filterScss.restore)
		.pipe(browserSync.stream())
}

// Задача для минификации стилей
export const stylesMin = () => {
	return gulp
		.src(cssDestination + '*.css')
		.pipe(cleanCSS())
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest(cssDestination))
}

// Задача для сборки изображений
export const images = () => {
	return gulp
		.src(paths.src.images)
		.pipe(changed(imagesDestination))
		.pipe(gulpIf(isProduction, webp()))
		.pipe(gulp.dest(imagesDestination))
		.pipe(gulp.src(paths.src.images))
		.pipe(changed(imagesDestination))
		.pipe(gulp.dest(imagesDestination))
		.pipe(gulpIf(isProduction, imagemin({ verbose: true })))
		.pipe(gulp.dest(imagesDestination))
		.pipe(browserSync.stream())
}

// Задача для копирования шрифтов
export const fonts = () => {
	return gulp
		.src(paths.src.fonts)
		.pipe(changed(fontsDestination))
		.pipe(gulp.dest(fontsDestination))
		.pipe(browserSync.stream())
}

// Задача для копирования файлов
export const files = () => {
	return gulp
		.src(paths.src.files)
		.pipe(changed(filesDestination))
		.pipe(gulp.dest(filesDestination))
		.pipe(browserSync.stream())
}

// Задача для сборки JavaScript
export const js = () => {
	return gulp
		.src(paths.src.js)
		.pipe(changed(jsDestination))
		.pipe(plumber(plumberNotify('JS')))
		.pipe(replace('@img', paths.img.js))
		.pipe(concat('app.js'))
		.pipe(gulp.dest(jsDestination))
		.pipe(browserSync.stream())
}

// Задача для минификации JavaScript
export const jsMin = () => {
	return gulp
		.src(jsDestination + '*.js')
		.pipe(terser())
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest(jsDestination))
}

// Задача для архивации собранного проекта
export const archive = () => {
	const source = paths.dest.dev + '**/*'
	const destination = './'

	return gulp
		.src(source, { base: paths.dest.dev })
		.pipe(zip(`${projectName}.zip`))
		.pipe(gulp.dest(destination))
}

// Задача для запуска сервера разработки
export const server = () => {
	browserSync.init(serverOptions)
}

// Задача для запуска сервера продакшна
export const serverCustomer = () => {
	browserSync.init(customerServerOptions)
}

// Задача для отслеживания изменений в файлах и автоматической пересборки
export const watch = () => {
	gulp.watch(paths.src.scss, gulp.series('styles'))
	gulp.watch(paths.src.html, gulp.series('html'))
	gulp.watch(paths.src.images, gulp.series('images'))
	gulp.watch(paths.src.fonts, gulp.series('fonts'))
	gulp.watch(paths.src.files, gulp.series('files'))
	gulp.watch(paths.src.js, gulp.series('js'))
}

// Задача для разработки
export const dev = gulp.series(
	cleanTask,
	gulp.parallel(html, styles, images, fonts, files, js),
	gulp.parallel(server, watch)
)

// Задача для продакшн
export const docs = gulp.series(
	cleanTask,
	gulp.parallel(html, styles, images, fonts, files, js),
	serverCustomer
)

// Задача для архивации проекта без минификации
export const zipTask = gulp.series(
	cleanTask,
	gulp.parallel(html, styles, images, fonts, files, js),
	archive
)

// Задача для архивации проекта с минификацией
export const zipTaskMin = gulp.series(
	cleanTask,
	gulp.parallel(html, styles, images, fonts, files, js),
	stylesMin,
	jsMin,
	archive
)

// Задача для минификации стилей и JavaScript
export const min = gulp.series(stylesMin, jsMin)

// Экспорт задачи по умолчанию
export default dev
