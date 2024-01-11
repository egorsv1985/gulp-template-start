

// // Предотвращение повторной отправки форм
// form.addEventListener('submit', () => {
// 	submitButton.disabled = true

// 	// Fix for Firefox. It persists the dynamic disabled state without this hack.
// 	submitButton.autocomplete = 'off'

// 	// We are using setTimeout for page-reload submit.
// 	// For AJAX, use await and try-finally to enable submit the button again.
// 	setTimeout(() => {
// 		submitButton.disabled = false
// 	}, 2000)
// })
//  form.addEventListener('submit', async () => {
//    await fetch(…)
//    try {
//      showLoader()
//      await fetch(…)
//    } catch (e) {
//      showError(e)
//    } finally {
//      hideLoader()
//    }
//   })

$(document).ready(function () {
	// Проверяем поддержку формата WebP
	function supportsWebP() {
		var elem = document.createElement('canvas')

		if (!!(elem.getContext && elem.getContext('2d'))) {
			// Was able or not to get WebP representation
			return elem.toDataURL('image/webp').indexOf('data:image/webp') == 0
		}

		// Very old browser like IE 8, canvas not supported
		return false
	}

	// Проверяем поддержку формата AVIF
	function supportsAvif() {
		var elem = document.createElement('canvas')

		if (!!(elem.getContext && elem.getContext('2d'))) {
			// Was able or not to get AVIF representation
			return elem.toDataURL('image/avif').indexOf('data:image/avif') == 0
		}

		// Very old browser like IE 8, canvas not supported
		return false
	}

	// Добавляем классы в зависимости от поддержки форматов
	if (supportsWebP()) {
		$('body').addClass('webp')
	}

	if (supportsAvif()) {
		$('body').addClass('avif')
	}
})
