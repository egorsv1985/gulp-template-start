import { serverOptions } from '../config/options.js'
import { plugins } from '../config/plugins.js'

// Задача для запуска сервера разработки
export const server = () => {
	plugins.browserSync.init(serverOptions)
}
