import errorFormatter from '@/lib/error-formatter.js'
import routes from './globbed-routes.js'
import secureRoute from '@/lib/secure-route.js'

/**
 * Given some lazily instantiated services, set up each route for the API.
 *
 * @param {object} services - The map containing all services.
 * @param {object} services.db - The database service object.
 * @param {object} services.config - The configuration service object.
 * @param {object} router - The router object to add routes to.
 */
export const setupRouter = (services, router) => {
	const { log } = services
	log.info('Adding routes:')

	routes.forEach(route => {
		// from:
		// route.path = 'route/api/v1/list/get.[listId].route.js'
		// to:
		// - method: GET
		// - path: api/v1/list/:listId
		let path = (
			route.path
				.replace(/^route\//, '')
				.replace(/\.route\.js$/, '')
				.replace(/\[([^\]]+)]/g, ':$1')
		).split('/')
		const method = path.pop()
		path = '/' + path.join('/')

		log.info(method.toUpperCase() + ' ' + path)

		router.add(method.toUpperCase(), path, async request => {
			log.debug(method.toUpperCase() + ' ' + path, {
				request: 'start',
				userId: request.currentUserId,
				sessionId: request.currentUserSessionId,
			})
			let errors
			try {
				if (route.export.security) {
					errors = await secureRoute(services, route.export.security, request)
				}
				if (!errors) {
					const response = await route.export.handler(services, request)
					log.info(`${method.toUpperCase()} ${path} - ${response.status}`)
					if (!response.status) {
						throw new Error('This is a developer error, all routes must specify a `status` value.')
					}
					if (response.json) {
						response.headers = response.headers || {}
						response.headers['Content-Type'] = 'application/json'
						if (response.body && response.body.errors) {
							response.body.errors = response.body.errors.map(errorFormatter)
						}
					}
					return response
				}
			} catch (error) {
				errors = [ errorFormatter(error) ]
				log.info(`${method.toUpperCase()} ${path}`, errors)
			}
			if (errors) {
				// error code is highest error code thrown
				let statusCode
				errors.forEach(error => {
					const status = parseInt(error.status, 10)
					if (!statusCode || status > statusCode) {
						statusCode = status
					}
				})
				return {
					status: statusCode,
					json: true,
					body: { errors: errors.map(errorFormatter) },
				}
			}
		})
	})
}
