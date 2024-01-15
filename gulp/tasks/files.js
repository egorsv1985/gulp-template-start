import { gulp, paths, filesDestination } from '../config/options'
import plugins from '../config/plugins'

// Задача для копирования файлов
export const files = () => {
	return gulp
		.src(paths.src.files)
		.pipe(plugins.changed(filesDestination))
		.pipe(gulp.dest(filesDestination))
		.pipe(plugins.browserSync.stream())
}
