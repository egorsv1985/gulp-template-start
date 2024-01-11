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
