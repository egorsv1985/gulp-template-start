import { gulp, cssDestination } from '../config/options'
import plugins from '../config/plugins'

// Задача для минификации стилей
export const stylesMin = () => {
	return gulp
		.src(cssDestination + '*.css')
		.pipe(plugins.cleanCSS())
		.pipe(plugins.rename({ suffix: '.min' }))
		.pipe(gulp.dest(cssDestination))
}
