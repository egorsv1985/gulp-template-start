const gulp = require('gulp')
const fileInclude = require('gulp-file-include')
const sass = require('gulp-sass')(require('sass'))
const clean = require('gulp-clean')
const fs = require('fs')
const sourceMaps = require('gulp-sourcemaps')
const plumber = require('gulp-plumber')
const notify = require('gulp-notify')
const changed = require('gulp-changed')
const sassGlob = require('gulp-sass-glob')
const postcss = require('gulp-postcss')
const imagemin = require('gulp-imagemin')
const webp = require('gulp-webp')
const webpHTML = require('gulp-webp-html')
const webImagesCSS = require('gulp-web-images-css')
const concat = require('gulp-concat')
const browserSync = require('browser-sync').create()
const filter = require('gulp-filter')
const gulpIf = require('gulp-if')
const replace = require('gulp-replace')
const zip = require('gulp-zip')

// Constants
const isProduction = process.env.NODE_ENV === 'production'

const packageJson = require('./package.json')
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

const cleanTask = function (done) {
	const destination = paths.dest.dev
	if (fs.existsSync(destination)) {
		return gulp.src(destination, { read: false }).pipe(clean({ force: true }))
	}
	done()
}

gulp.task('html', function () {
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
})

gulp.task('sass', function () {
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
		.pipe(gulpIf(isProduction, webImagesCSS({ mode: 'all' })))
		.pipe(sourceMaps.write())
		.pipe(filterScss)
		.pipe(gulp.dest(destination))
		.pipe(filterScss.restore)
		.pipe(browserSync.stream())
})

gulp.task('images', function () {
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
})

// Fonts Task
gulp.task('fonts', function () {
	const destination = paths.dest.dev + 'fonts/'
	return gulp
		.src(paths.src.fonts)
		.pipe(changed(destination))
		.pipe(gulp.dest(destination))
		.pipe(browserSync.stream())
})

// Files Task
gulp.task('files', function () {
	const destination = paths.dest.dev + 'files/'
	return gulp
		.src(paths.src.files)
		.pipe(changed(destination))
		.pipe(gulp.dest(destination))
		.pipe(browserSync.stream())
})

// JavaScript Task
gulp.task('js', function () {
	const destination = paths.dest.dev + 'js/'
	return gulp
		.src(paths.src.js)
		.pipe(changed(destination))
		.pipe(plumber(plumberNotify('JS')))
		.pipe(replace('@img', paths.img.js))
		.pipe(concat('app.js'))
		.pipe(gulp.dest(destination))
		.pipe(browserSync.stream())
})

gulp.task('archive', function () {
	const source = paths.dest.dev + '**/*'
	const destination = './'

	return gulp
		.src(source)
		.pipe(zip(`${projectName}.zip`))
		.pipe(gulp.dest(destination))
})

gulp.task('server', function () {
	browserSync.init(serverOptions)
})

gulp.task('server-customer', function () {
	browserSync.init(customerServerOptions)
})

gulp.task('watch', function () {
	gulp.watch(paths.src.scss, gulp.series('sass'))
	gulp.watch(paths.src.html, gulp.series('html'))
	gulp.watch(paths.src.images, gulp.series('images'))
	gulp.watch(paths.src.fonts, gulp.series('fonts'))
	gulp.watch(paths.src.files, gulp.series('files'))
	gulp.watch(paths.src.js, gulp.series('js'))
})

gulp.task(
	'dev',
	gulp.series(
		cleanTask,
		gulp.parallel('html', 'sass', 'images', 'fonts', 'files', 'js'),
		gulp.parallel('server', 'watch')
	)
)

gulp.task(
	'docs',
	gulp.series(
		cleanTask,
		gulp.parallel('html', 'sass', 'images', 'fonts', 'files', 'js'),
		'server-customer'
	)
)

gulp.task('zip', gulp.series('docs', 'archive'))

gulp.task('default', gulp.series('dev'))
