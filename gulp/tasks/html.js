import {
	destination,
	plumberNotify,
	fileIncludeSettings,
	isProduction,
} from '../config/options.js'
import { paths } from '../config/paths.js'
import { plugins } from '../config/plugins.js'

// Задача для сборки HTML

// Задача для сборки HTML
export const html = () => {
	return plugins.gulp
		.src(paths.src.html)
		.pipe(plugins.plumber(plumberNotify('HTML')))
		.pipe(plugins.fileInclude({ ...fileIncludeSettings, force: true }))
		.pipe(plugins.gulpIf(isProduction, plugins.webpHTML()))
		.pipe(plugins.replace('@img', paths.img.html))
		.pipe(plugins.changed(destination, { extension: '.html' }))
		.pipe(plugins.gulp.dest(destination))
		.pipe(plugins.browserSync.stream())
}
