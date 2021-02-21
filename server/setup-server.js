import errorFormatter from 'lib/error-formatter.js'
import routes from './globbed-routes.js'
import sirv from 'sirv'
import compression from 'compression'
import { json } from 'lib/polka-parser.js'

const errorHandler = handler => async (req, res) => {
	try {
		return await handler(req, res)
	} catch (error) {
		error = errorFormatter(error)
		res.setHeader('Content-Type', 'application/json')
		res.statusCode = parseInt(error.status, 10)
		res.end(JSON.stringify({ errors: [ error ] }))
	}
}

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
		if (verbose) { console.log(' - ' + method.toUpperCase() + ' ' + path) }
		api[method](path, errorHandler(route.export.handler))
	})
}
