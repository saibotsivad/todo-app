import errorFormatter from 'lib/error-formatter.js'
import log from 'lib/log.js'
import routes from './globbed-routes.js'
import compression from 'compression'
import secureRoute from 'lib/secure-route.js'
import { json } from 'lib/polka-parser.js'
import serveStatic from 'serve-static'

const setJson = res => res.setHeader('Content-Type', 'application/json')

export const setupServer = (api, { verbose = false, development = false } = {}) => {
	log.info('Adding routes:')

	api.use(
		json(),
		compression(),
		serveStatic('./public')
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

		log.info(method.toUpperCase() + ' ' + path)

		api[method](path, async (req, res) => {
			let errors
			try {
				if (route.export.security) {
					errors = await secureRoute(route.export.security, req)
				}
				if (!errors) {
					const response = await route.export.handler(req, res)
					log.info(`${method.toUpperCase()} ${path} - ${response.status}`)
					if (!response.status) {
						throw new Error('This is a developer error, all routes must specify a `statusCode` value.')
					}
					res.statusCode = response.status
					if (response.json) {
						setJson(res)
						res.end(JSON.stringify(response.body || {}))
					} else if (response.body) {
						res.end(response.body)
					}
				}
			} catch (error) {
				errors = [ errorFormatter(error) ]
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
				log.info(`${method.toUpperCase()} ${path} - ${res.statusCode}`)
				res.end(JSON.stringify({
					errors: errors
						.map(errorFormatter)
						.map(error => {
							if (!development && error.meta && error.meta.stacktrace) {
								let { meta: { stacktrace, ...meta }, ...data } = error
								meta = Object.keys(meta).length ? meta : undefined
								return Object.assign({}, data, { meta })
							}
							return error
						})
				}))
			}
		})
	})
}
