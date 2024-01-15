import { gulp, paths } from '../config/options'

// Задача для отслеживания изменений в файлах и автоматической пересборки
export const watch = () => {
	gulp.watch(paths.src.scss, gulp.series('styles'))
	gulp.watch(paths.src.html, gulp.series('html'))
	gulp.watch(paths.src.images, gulp.series('images'))
	gulp.watch(paths.src.fonts, gulp.series('fonts'))
	gulp.watch(paths.src.files, gulp.series('files'))
	gulp.watch(paths.src.js, gulp.series('scripts'))
}
