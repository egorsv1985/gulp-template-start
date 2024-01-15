import { gulp, paths, fontsDestination } from '../config/options'
import plugins from '../config/plugins'

// Задача для копирования шрифтов
export const fonts = () => {
	return gulp
		.src(paths.src.fonts)
		.pipe(plugins.changed(fontsDestination))
		.pipe(gulp.dest(fontsDestination))
		.pipe(plugins.browserSync.stream())
}
