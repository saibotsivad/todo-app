import { router } from 'lib/router.js'
import routes from './globbed-routes.js'

routes.forEach(route => {
	router.addState(route)
})

router.evaluateCurrentRoute('login')
