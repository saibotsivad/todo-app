import { router } from 'lib/state-router.js'
import routes from './globbed-routes.js'

routes.forEach(route => {
	// TODO: this feels like it should be part of the glob generation script
	// from:
	// route.path = 'route/app/list/[listId]/todo/[todoId].route.js'
	// to:
	// route.export.name = 'app.list.listId.todo.todoId'
	// route.export.route '/:todoId'
	// 
	route.export.name = route.path
		.replace(/^route\//, '')
		.replace(/\.route\.js$/, '')
		.replace(/\//g, '.')
		.replace(/[\[\]]/g, '')
	route.export.route = '/' + route.path
		.split('/')
		.pop()
		.replace(/\.route\.js$/, '')
		.replace(/\[([^\]]+)\]/g, ':$1')
	router.addState(route.export)
})

router.on('stateChangeError', error => {
	console.log('stateChangeError', error)
	// const redirect = JSON.stringify({
	// 	name: 'foo.bar',
	// 	params: { fizz: 'buzz' }
	// })
})

router.evaluateCurrentRoute('login')
