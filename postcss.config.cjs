module.exports = {
	plugins: [
		require('autoprefixer'), // Добавление вендорных префиксов
		require('postcss-preset-env'), // Использование новых возможностей CSS
		require('postcss-custom-media'), // Поддержка пользовательских медиазапросов
		require('postcss-nested'), // Вложенные правила, как в препроцессорах
		// require('cssnano'), // Минификация и оптимизация CSS
		require('postcss-flexbugs-fixes'), // Исправления для багов в Flexbox
		// require('postcss-uncss')({
		// 	html: ['**/*.html'],
		// 	ignore: ['**/*.js', '/node_modules/', '/src/'],
		// }),
		// require('css-mqpacker'),
		require('postcss-reporter'),
		require('postcss-pxtorem')({
			rootValue: 16,
			unitPrecision: 5,
			propList: ['font', 'font-size', 'line-height', 'letter-spacing'],
			selectorBlackList: [],
			replace: true,
			mediaQuery: false,
			minPixelValue: 0,
			exclude: /node_modules/i,
		}),
		require('postcss-sort-media-queries')(),
		require('postcss-animation'),
		require('webp-in-css/plugin'),
		// Добавьте другие плагины, если они вам необходимы
	],
}
