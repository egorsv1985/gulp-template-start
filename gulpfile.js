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
import webpHTML from 'gulp-webp-html'
import concat from 'gulp-concat'
import browserSync from 'browser-sync'
import filter from 'gulp-filter'
import gulpIf from 'gulp-if'
import replace from 'gulp-replace'
import zip from 'gulp-zip'

// Constants
const isProduction = process.env.NODE_ENV === 'production'

const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))
const projectName = packageJson.name

const fileIncludeSettings = {
	prefix: '@@',
	basepath: '@file',
}

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

const sassOptions = {
	includePaths: ['./node_modules'],
}

const autoprefixerOptions = {
	grid: true,
	overrideBrowserslist: ['last 8 versions'],
	cascade: true,
}

const serverOptions = {
	server: {
		baseDir: paths.dest.dev,
	},
	port: 3000,
	open: true,
	notify: false,
}

const customerServerOptions = {
	server: {
		baseDir: paths.dest.dev,
	},
	port: 4000,
	open: true,
	notify: false,
}

const plumberNotify = title => {
	return {
		errorHandler: notify.onError({
			title: title,
			message: 'Error <%= error.message %>',
			sound: false,
		}),
	}
}

const cleanTask = done => {
	const destination = paths.dest.dev
	if (fs.existsSync(destination)) {
		return gulp.src(destination, { read: false }).pipe(clean({ force: true }))
	}
	done()
}

export const html = () => {
	const destination = paths.dest.dev
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

export const styles = () => {
	const destination = paths.dest.dev + 'css/'
	const filterScss = filter(['**/*', '!src/scss/**/_*.scss'], {
		restore: true,
	})

	return gulp
		.src(paths.src.scss)
		.pipe(changed(destination))
		.pipe(plumber(plumberNotify('SCSS')))
		.pipe(sourceMaps.init())
		.pipe(sassGlob())
		.pipe(sass(sassOptions))
		.pipe(replace('@img', paths.img.css))
		.pipe(gulpIf(isProduction, postcss()))
		.pipe(sourceMaps.write())
		.pipe(filterScss)
		.pipe(gulp.dest(destination))
		.pipe(filterScss.restore)
		.pipe(browserSync.stream())
}

export const images = () => {
	const destination = paths.dest.dev + 'images/'
	return gulp
		.src(paths.src.images)
		.pipe(changed(destination))
		.pipe(gulpIf(isProduction, webp()))
		.pipe(gulp.dest(destination))
		.pipe(gulp.src(paths.src.images))
		.pipe(changed(destination))
		.pipe(gulp.dest(destination))
		.pipe(gulpIf(isProduction, imagemin({ verbose: true })))
		.pipe(gulp.dest(destination))
		.pipe(browserSync.stream())
}

// Fonts Task
export const fonts = () => {
	const destination = paths.dest.dev + 'fonts/'
	return gulp
		.src(paths.src.fonts)
		.pipe(changed(destination))
		.pipe(gulp.dest(destination))
		.pipe(browserSync.stream())
}

// Files Task
export const files = () => {
	const destination = paths.dest.dev + 'files/'
	return gulp
		.src(paths.src.files)
		.pipe(changed(destination))
		.pipe(gulp.dest(destination))
		.pipe(browserSync.stream())
}

// JavaScript Task
export const js = () => {
	const destination = paths.dest.dev + 'js/'
	return gulp
		.src(paths.src.js)
		.pipe(changed(destination))
		.pipe(plumber(plumberNotify('JS')))
		.pipe(replace('@img', paths.img.js))
		.pipe(concat('app.js'))
		.pipe(gulp.dest(destination))
		.pipe(browserSync.stream())
}

export const archive = () => {
	const source = paths.dest.dev + '**/*'
	const destination = './'

	return gulp
		.src(source)
		.pipe(zip(`${projectName}.zip`))
		.pipe(gulp.dest(destination))
}

export const server = () => {
	browserSync.init(serverOptions)
}

export const serverCustomer = () => {
	browserSync.init(customerServerOptions)
}

export const watch = () => {
	gulp.watch(paths.src.scss, gulp.series('styles'))
	gulp.watch(paths.src.html, gulp.series('html'))
	gulp.watch(paths.src.images, gulp.series('images'))
	gulp.watch(paths.src.fonts, gulp.series('fonts'))
	gulp.watch(paths.src.files, gulp.series('files'))
	gulp.watch(paths.src.js, gulp.series('js'))
}

export const dev = gulp.series(
	cleanTask,
	gulp.parallel(html, styles, images, fonts, files, js),
	gulp.parallel(server, watch)
)

export const docs = gulp.series(
	cleanTask,
	gulp.parallel(html, styles, images, fonts, files, js),
	serverCustomer
)

export const zipTask = gulp.series(docs, archive)

export default dev
