import errorFormatter from 'lib/error-formatter.js'
import routes from './globbed-routes.js'
import sirv from 'sirv'
import compression from 'compression'
import secureRoute from 'lib/secure-route.js'
import { json } from 'lib/polka-parser.js'

export const setupServer = (api, options = { verbose: false, maxAge: 60 }) => {
	const { verbose, maxAge } = options

	if (verbose) { console.log('Adding routes:') }

	api.use(
		compression(),
		sirv('./public', { maxAge }),
		json()
	)

	routes.forEach(route => {
		// from:
		// route.path = 'route/api/v1/list/[listId]/todo/[todoId]/get.route.js'
		// to:
		// - method: GET
		// - path: api/v1/list/:listId/todo/:todoId
		let path = (
			route.path
				.replace(/^route\//, '')
				.replace(/\.route\.js$/, '')
				.replace(/\[([^\]]+)\]/g, ':$1')
		).split('/')
		const method = path.pop()
		path = '/' + path.join('/')
		if (verbose) {
			console.log(' - ' + method.toUpperCase() + ' ' + path)
		}
		api[method](path, async (req, res) => {
			let errors
			try {
				if (route.export.security) {
					errors = await secureRoute(route.export.security, req)
				}
				if (!errors) {
					return await route.export.handler(req, res)
				}
			} catch (error) {
				errors = [ errorFormatter(error) ]
			}
			if (errors) {
				res.setHeader('Content-Type', 'application/json')
				// error code is highest error code thrown
				errors.forEach(error => {
					const status = parseInt(error.status, 10)
					if (!res.statusCode || status > res.statusCode) {
						res.statusCode = status
					}
				})
				res.end(JSON.stringify({ errors }))
			}
		})
	})
}
