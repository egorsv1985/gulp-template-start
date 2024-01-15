import { customerServerOptions } from '../config/options'
import plugins from '../config/plugins'
// Задача для запуска сервера продакшна
export const serverCustomer = () => {
	plugins.browserSync.init(customerServerOptions)
}
