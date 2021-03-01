import { router } from 'lib/state-router.js'
import { getCurrentUser, login } from 'api/user.js'
import template from './Login.svelte'

const getRedirect = parameters => {
	let name = 'app'
	let params
	try {
		const redirect = JSON.stringify(parameters.redirect)
		name = redirect.name
		params = redirect.params
	} catch (ignore) {
		// bad data or no redirect found
	}
	return { name, params }
}

export default {
	template,
	resolve: (data, parameters) => getCurrentUser()
		.then(
			// resolved promise means the user is logged in, so
			// redirect to the original location if one is set
			// in query params, or to `app` otherwise
			({ user }) => Promise.reject({
				redirectTo: getRedirect(parameters)
			}),
			// user is not logged in, present normal login
			() => ({ parameters })
		),
	activate: ({ domApi }) => {
		domApi.$on('login', ({ detail: { email, password }}) => {
			domApi.$set({ disabled: true })
			login({ email, password })
				.then(response => {
					console.log('done', response)
					domApi.$set({
						success: true
					})
				})
				.catch(error => {
					console.error('error', error)
					domApi.$set({
						disabled: false,
						errors: error.body.errors
					})
				})
		})
	}
}
