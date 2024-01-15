// Задача для очистки папки dist перед сборкой
export const cleanTask = done => {
	if (fs.existsSync(destination)) {
		return gulp.src(destination, { read: false }).pipe(clean({ force: true }))
	}
	done()
}
