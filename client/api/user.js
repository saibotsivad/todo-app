import makeCache from 'lib/cache-get-request.js'

const cache = makeCache()

export const getCurrentUser = cache(
	() => fetch('/api/v1/currentUser')
		.then(response => {
			if (response.status >= 400) {
				throw response
			}
			return { user: response.data }
		})
)
