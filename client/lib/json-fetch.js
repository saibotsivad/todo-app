function api (method, url, options = {}) {
	return fetch(
		url,
		Object.assign(
			{
				method,
				headers: {
					'Content-Type': 'application/json'
				}
			},
			options.body
				? { body: JSON.stringify(options.body) }
				: {}
		)
	)
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
}

export const get = api.bind(null, 'GET')
export const post = api.bind(null, 'POST')
export const patch = api.bind(null, 'PATCH')
export const del = api.bind(null, 'DELETE')
export const put = api.bind(null, 'PUT')
