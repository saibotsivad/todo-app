import errorFormatter from '@/lib/error-formatter.js'
import routes from './globbed-routes.js'
// import compression from 'compression'
import secureRoute from '@/lib/secure-route.js'
import { json } from '@/lib/polka-parser.js'
// import serveStatic from 'serve-static'

const setJson = res => res.setHeader('Content-Type', 'application/json')

/**
 * Given some lazily instantiated services, set up each route for the API.
 *
 * @param {object} services - The map containing all services.
 * @param {object} services.db - The database service object.
 * @param {object} services.config - The configuration service object.
 * @param {object} api - The polka-like server to add routes to.
 */
export const setupServer = (services, api) => {
	const { log } = services
	log.info('Adding routes:')

	api.use(
		json()
		// compression(),
		// serveStatic('./public')
	)

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

		api[method](path, async (req, res) => {
			log.debug(method.toUpperCase() + ' ' + path, {
				request: 'start',
				userId: req.currentUserId,
				sessionId: req.currentUserSessionId
			})
			let errors
			try {
				if (route.export.security) {
					errors = await secureRoute(services, route.export.security, req)
				}
				if (!errors) {
					const response = await route.export.handler(services, req, res)
					log.info(`${method.toUpperCase()} ${path} - ${response.status}`)
					if (!response.status) {
						throw new Error('This is a developer error, all routes must specify a `status` value.')
					}
					res.statusCode = response.status
					if (response.headers) {
						for (const [ key, value ] of Object.entries(response.headers)) {
							res.setHeader(key, value)
						}
					}
					if (response.json) {
						setJson(res)
						if (response.body && response.body.errors) {
							response.body.errors = response.body.errors.map(errorFormatter)
						}
						res.end(JSON.stringify(response.body || {}))
					} else if (response.body) {
						res.end(response.body)
					}
				}
			} catch (error) {
				errors = [ errorFormatter(error) ]
				log.info(`${method.toUpperCase()} ${path} - ${res.statusCode}`, errors)
			}
			if (errors) {
				setJson(res)
				// error code is highest error code thrown
				errors.forEach(error => {
					const status = parseInt(error.status, 10)
					if (!res.statusCode || status > res.statusCode) {
						res.statusCode = status
					}
				})
				res.end(JSON.stringify({
					errors: errors.map(errorFormatter)
				}))
			}
		})
	})
}
