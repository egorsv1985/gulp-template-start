import {
	gulp,
	paths,
	cssDestination,
	isProduction,
	sassOptions,
} from '../config/options'
import plugins from '../config/plugins'

// Задача для сборки стилей
export const styles = () => {
	const filterScss = filter(['**/*', '!src/scss/**/_*.scss'], {
		restore: true,
	})

	return gulp
		.src(paths.src.scss)
		.pipe(plugins.changed(cssDestination))
		.pipe(plugins.plumber(plumberNotify('SCSS')))
		.pipe(plugins.sourceMaps.init())
		.pipe(plugins.sassGlob())
		.pipe(plugins.sass(sassOptions))
		.pipe(plugins.replace('@img', paths.img.css))
		.pipe(plugins.gulpIf(isProduction, plugins.postcss()))
		.pipe(plugins.sourceMaps.write())
		.pipe(filterScss)
		.pipe(gulp.dest(cssDestination))
		.pipe(filterScss.restore)
		.pipe(plugins.browserSync.stream())
}
