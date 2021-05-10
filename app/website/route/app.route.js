import { router } from '@/lib/state-router.js'
import { getCurrentUser, logout } from '@/service/api/user.js'
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
				submitting: true,
				disabled: true,
				success: null,
				errors: null
			})
			logout()
				.then(response => {
					console.log('done', response)
					router.go('login', { logout: true })
				})
				.catch(error => {
					console.error('error', error)
					domApi.$set({
						submitting: false,
						disabled: false,
						errors: error.body.errors
					})
				})
		})
	}
}
