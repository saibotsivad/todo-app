import makeCache from 'lib/cache-get-request.js'

const cache = makeCache()

export const getCurrentUser = cache(
	() => fetch('/api/v1/auth/user')
		.then(response => {
			if (response.status >= 400) {
				throw response
			}
			return { user: response.data }
		})
)

export const login = async ({ email, password }) => fetch('/api/v1/auth/login', {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json'
	},
	body: JSON.stringify({ email, password })
})
	.then(async response => ({
		status: response.status,
		body: await response.json()
	}))
	.then(response => {
		if (response.status >= 400) {
			throw response
		}
		return response
	})
