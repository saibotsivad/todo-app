import errorFormatter from '@/lib/error-formatter.js'

const fourOhFour = () => ({
	status: 404,
	json: true,
	body: {
		errors: [
			{
				code: 'NotFound',
				title: 'The requested resource could not be found.',
				detail: 'The URL was valid, but no route handler was located.'
			}
		]
	}
})

/**
 * @typedef {object} ClientRequest
 * @property {string} method - The request method, in uppercase.
 * @property {URL} url - The full, parsed URL of the request.
 * @property {string} hostname - The host, e.g. the domain.
 * @property {string} pathname - The path part of the URL.
 * @property {string} search - The query parameter part of the URL, with the leading question mark.
 * @property {object} query - The query parameters parsed as key-(value|array<value>) pairs.
 * @property {object} headers - The key-value headers, where the keys are normalized to lower-case.
 * @property {string} body - The fully-realized, un-parsed body.
 * @property {object} [params] - The path parameters as key-value pairs.
 */

/**
 *
 * @param {object} router - A fully instantiated router.
 * @param {ClientRequest} request - The incoming HTTP request.
 */
export const routeRequest = async (router, request) => {
	const { params, handlers } = router.find(request.method, request.pathname)

	if (!handlers || !handlers.length) {
		return fourOhFour()
	}

	request.params = params

	try {
		return await handlers[0](request)
	} catch (error) {
		const errors = [ errorFormatter(error) ]
		return {
			status: parseInt(errors[0].status, 10),
			json: true,
			body: { errors }
		}
	}
}
