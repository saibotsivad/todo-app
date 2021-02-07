import routes from './globbed-routes.js'
import sirv from 'sirv'
import compression from 'compression'

const compress = compression()

const staticPublicFiles = sirv('./public', {
	maxAge: 60
})

export const setupServer = (api, verbose) => {
	if (verbose) { console.log('Adding routes:') }

	api.use(compress, staticPublicFiles)

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
		api[method](path, route.export.handler)
	})
}
