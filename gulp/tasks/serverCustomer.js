import { customerServerOptions } from '../config/options.js'
import { plugins } from '../config/plugins.js'
// Задача для запуска сервера продакшна
export const serverCustomer = () => {
	plugins.browserSync.init(customerServerOptions)
}
