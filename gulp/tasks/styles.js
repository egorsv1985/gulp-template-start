// import {
// 	cssDestination,
// 	plumberNotify,
// 	sassOptions,
// 	isProduction,
// 	filterScss,
// 	postcssPlugins,
// 	useTailwind,
// } from '../config/options.js'
// import { paths } from '../config/paths.js'
// import { plugins } from '../config/plugins.js'

// // Задача для сборки стилей
// export const styles = () => {
// 	return plugins.gulp
// 		.src(paths.src.scss)
// 		.pipe(plugins.changed(cssDestination))
// 		.pipe(plugins.plumber(plumberNotify('SCSS')))
// 		.pipe(plugins.sourceMaps.init())
// 		.pipe(plugins.sassGlob())
// 		.pipe(plugins.sass(sassOptions))
// 		.pipe(plugins.replace('@img', paths.img.css))
// 		.pipe(plugins.gulpIf(isProduction, plugins.postcss(postcssPlugins)))
// 		.pipe(useTailwind && plugins.postcss(postcssPlugins.tailwindPlugins))
// 		.pipe(plugins.sourceMaps.write())
// 		.pipe(filterScss)
// 		.pipe(plugins.gulp.dest(cssDestination))
// 		.pipe(filterScss.restore)
// 		.pipe(plugins.browserSync.stream())
// }
import {
	cssDestination,
	plumberNotify,
	sassOptions,
	isProduction,
	filterScss,
	postcssPlugins,
	useTailwind,
} from '../config/options.js'
import { paths } from '../config/paths.js'
import { plugins } from '../config/plugins.js'

// Задача для сборки стилей
export const styles = () => {
	const {
		gulp,
		changed,
		plumber,
		sourceMaps,
		sassGlob,
		sass,
		replace,
		gulpIf,
		postcss,
		browserSync,
	} = plugins

	return gulp
		.src(paths.src.scss)
		.pipe(changed(cssDestination))
		.pipe(plumber(plumberNotify('SCSS')))
		.pipe(sourceMaps.init())
		.pipe(sassGlob())
		.pipe(sass(sassOptions))
		.pipe(replace('@img', paths.img.css))
		.pipe(gulpIf(isProduction, postcss(postcssPlugins)))
		.pipe(useTailwind && postcss(postcssPlugins.tailwindPlugins))
		.pipe(sourceMaps.write())
		.pipe(filterScss)
		.pipe(gulp.dest(cssDestination))
		.pipe(filterScss.restore)
		.pipe(browserSync.stream())
}
