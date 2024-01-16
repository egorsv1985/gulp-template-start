import { fontsDestination } from '../config/options.js'
import { paths } from '../config/paths.js'
import { plugins } from '../config/plugins.js'

// Задача для копирования шрифтов
export const fonts = () => {
	return plugins.gulp
		.src(paths.src.fonts)
		.pipe(plugins.changed(fontsDestination))
		.pipe(plugins.gulp.dest(fontsDestination))
		.pipe(plugins.browserSync.stream())
}
