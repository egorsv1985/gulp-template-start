import { gulp, paths, imagesDestination, isProduction } from '../config/options'
import plugins from '../config/plugins'

// Задача для сборки изображений
export const images = () => {
	return gulp
		.src(paths.src.images)
		.pipe(plugins.newer(imagesDestination))
		.pipe(plugins.changed(imagesDestination))
		.pipe(plugins.gulpIf(isProduction, plugins.webp()))
		.pipe(gulp.dest(imagesDestination))
		.pipe(gulp.src(paths.src.images))
		.pipe(plugins.newer(imagesDestination))
		.pipe(plugins.changed(imagesDestination))
		.pipe(gulp.dest(imagesDestination))
		.pipe(plugins.gulpIf(isProduction, plugins.imagemin({ verbose: true })))
		.pipe(gulp.dest(imagesDestination))
		.pipe(plugins.browserSync.stream())
}
