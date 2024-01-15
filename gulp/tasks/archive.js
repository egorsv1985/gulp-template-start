import { gulp, paths, source, archiveDestination } from '../config/options'
import plugins from '../config/plugins'

// Задача для архивации собранного проекта
export const archive = () => {
	return gulp
		.src(source, { base: paths.dest.dev })
		.pipe(plugins.zip(`${projectName}.zip`))
		.pipe(gulp.dest(archiveDestination))
}
