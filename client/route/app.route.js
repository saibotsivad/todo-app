import { getCurrentUser, logout } from 'api/user.js'
import template from './App.svelte'

export default {
	template,
	defaultChild: 'list',
	resolve: async () => {
		return {
			user: await getCurrentUser()
		}
	},
	activate: ({ domApi }) => {
		domApi.$on('logout', () => {
			console.log('logging out')
			domApi.$set({
				disabled: true,
				success: null,
				errors: null
			})
			logout()
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
