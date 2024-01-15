// Константа, определяющая режим сборки (разработка или продакшн)
export const isProduction = process.env.NODE_ENV === 'production'

// Чтение информации о проекте из package.json
export const packageJson = JSON.parse(
	fs.readFileSync('./package.json', 'utf-8')
)
export const projectName = packageJson.name

// Настройки для gulp-file-include
export const fileIncludeSettings = {
	prefix: '@@',
	basepath: '@file',
}
// Опции для компиляции Sass
export const sassOptions = {
	includePaths: ['./node_modules'],
}

// Определение путей для различных задач
export const destination = paths.dest.dev
export const cssDestination = destination + 'css/'
export const imagesDestination = destination + 'images/'
export const fontsDestination = destination + 'fonts/'
export const filesDestination = destination + 'files/'
export const jsDestination = destination + 'js/'
export const archiveDestination = './'
export const source = paths.dest.dev + '**/*'

// Настройки сервера для разработки
export const serverOptions = {
	server: {
		baseDir: paths.dest.dev,
	},
	port: 3000,
	open: true,
	notify: false,
}

// Настройки сервера для продакшна
export const customerServerOptions = {
	server: {
		baseDir: paths.dest.dev,
	},
	port: 4000,
	open: true,
	notify: false,
}

// Функция для обработки ошибок с уведомлением
export const plumberNotify = title => {
	return {
		errorHandler: notify.onError({
			title: title,
			message: 'Error <%= error.message %>',
			sound: false,
		}),
	}
}
