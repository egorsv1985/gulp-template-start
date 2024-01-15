import { serverOptions } from '../config/options'
import plugins from '../config/plugins'

// Задача для запуска сервера разработки
export const server = () => {
	plugins.browserSync.init(serverOptions)
}
