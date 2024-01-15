import {
	gulp,
	paths,
	destination,
	isProduction,
	fileIncludeSettings,
} from '../config/options'
import plugins from '../config/plugins'

// Задача для сборки HTML
export const html = () => {
	const filterHTML = plugins.filter(['**/*.html', '!**/_*.html'], {
		restore: true,
	})

	return gulp
		.src(paths.src.html)
		.pipe(plugins.changed(destination))
		.pipe(plugins.plumber(plugins.plumberNotify('HTML')))
		.pipe(plugins.fileInclude(fileIncludeSettings))
		.pipe(plugins.gulpIf(isProduction, plugins.webpHTML()))
		.pipe(plugins.replace('@img', paths.img.html))
		.pipe(filterHTML)
		.pipe(gulp.dest(destination))
		.pipe(filterHTML.restore)
		.pipe(plugins.browserSync.stream())
}
