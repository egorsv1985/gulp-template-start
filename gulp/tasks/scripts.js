import { gulp, paths, jsDestination } from '../config/options'
import plugins from '../config/plugins'

// Задача для сборки JavaScript
export const scripts = () => {
	return gulp
		.src(paths.src.js)
		.pipe(plugins.changed(jsDestination))
		.pipe(plugins.plumber(plumberNotify('JS')))
		.pipe(plugins.replace('@img', paths.img.js))
		.pipe(plugins.concat('app.js'))
		.pipe(gulp.dest(jsDestination))
		.pipe(plugins.browserSync.stream())
}
