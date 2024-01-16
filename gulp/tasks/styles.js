import {
	cssDestination,
	plumberNotify,
	sassOptions,
	isProduction,
} from '../config/options.js'
import { paths } from '../config/paths.js'
import { plugins } from '../config/plugins.js'

// Задача для сборки стилей
export const styles = () => {
	const filterScss = plugins.filter(['**/*', '!src/scss/**/_*.scss'], {
		restore: true,
	})

	return plugins.gulp
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
		.pipe(plugins.gulp.dest(cssDestination))
		.pipe(filterScss.restore)
		.pipe(plugins.browserSync.stream())
}
