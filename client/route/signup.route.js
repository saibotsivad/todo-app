import { createUser } from 'api/user.js'
import template from './Signup.svelte'

export default {
	template,
	activate: ({ domApi }) => {
		domApi.$on('signup', ({ detail: { email, password } }) => {
			domApi.$set({
				disabled: true,
				success: null,
				errors: null
			})
			console.log('signing up', email, password)
			createUser({ email, password })
				.then(response => {
					console.log('done', response)
					domApi.$set({
						disabled: false,
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
