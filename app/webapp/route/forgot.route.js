import { forgotPassword } from '@/service/api/user.js'
import template from './Forgot.svelte'

export default {
	template,
	activate: ({ domApi }) => {
		domApi.$on('submit', ({ detail: { email } }) => {
			domApi.$set({
				disabled: true,
				success: null,
				errors: null,
			})
			console.log('asking for reset password email', email)
			forgotPassword({ email })
				.then(response => {
					console.log('done', response)
					domApi.$set({
						disabled: false,
						success: true,
					})
				})
				.catch(error => {
					console.error('error', error)
					domApi.$set({
						disabled: false,
						errors: error.body.errors,
					})
				})
		})
	},
}
