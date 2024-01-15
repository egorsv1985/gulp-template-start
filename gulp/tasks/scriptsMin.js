import { gulp, jsDestination } from '../config/options'
import plugins from '../config/plugins'
// Задача для минификации JavaScript
export const scriptsMin = () => {
	return gulp
		.src(jsDestination + '*.js')
		.pipe(plugins.terser())
		.pipe(plugins.rename({ suffix: '.min' }))
		.pipe(gulp.dest(jsDestination))
}
