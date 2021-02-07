import { getCurrentUser } from 'api/user.js'
import template from './App.svelte'

export default {
	template,
	defaultChild: 'list',
	resolve: async () => {
		return {
			user: await getCurrentUser()
		}
	}
}
