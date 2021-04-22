import { router } from 'lib/state-router.js'
import routes from './globbed-routes.js'

const shouldScrollToTop = (currentState, previousState) => {
	// you can add more logic here as needed
	return currentState !== previousState
}

const stateChangeHistory = []

routes.forEach(route => {
	route.export.name = route.path
		.replace(/^route\//, '')
		.replace(/\.route\.js$/, '')
		.replace(/\//g, '.')
		.replace(/[[\]]/g, '')
	route.export.route = '/' + route.path
		.split('/')
		.pop()
		.replace(/\.route\.js$/, '')
		.replace(/\[([^\]]+)\]/g, ':$1')
	router.addState(route.export)
})

router.on('routeNotFound', (...args) => {
	console.error('routeNotFound', ...args)
	// if the route is not found, there is not much to be done, so we
	// could forward them to an error page, or we could send them back
	// to the start (which is what we do here)
	window.location = '/'
})

router.on('stateError', error => {
	console.error('stateError', error)
})

router.on('stateChangeEnd', state => {
	if (state.data && state.data.title) {
		// set page title
	}
})

router.on('stateChangeStart', (state, parameters) => {
	const previousState = stateChangeHistory[stateChangeHistory.length - 1]
	const previousStateName = previousState && previousState.state.name && previousState.state.name
	if (shouldScrollToTop(state.name, previousStateName)) {
		window.scrollTo(0, 0)
	}
	stateChangeHistory.push({ state, parameters })
})

router.on('stateChangeError', error => {
	if (error.status === 403 || error.status === 401) {
		const previousState = stateChangeHistory[stateChangeHistory.length - 1]
		if (previousState) {
			router.go('login', {
				original: JSON.stringify({
					name: previousState.state.name,
					params: previousState.parameters
				})
			})
		} else {
			router.go('login')
		}
	} else {
		console.error('stateChangeError', error)
	}
})

router.evaluateCurrentRoute('login')
