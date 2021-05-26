import { name as cookie, authorize } from '@/lib/security/cookie.js'
import { session } from '@/lib/tags.js'
import { listSessionsByUserId } from '@/lib/controller/session/list-sessions-by-user-id.js'
import { paginatedLinks } from '@/lib/paginated-links.js'

export const summary = `
	List users cookie sessions.
`

export const description = `
	List all cookie sessions for the currently logged in user.
`

export const tags = [
	session,
]

export const responses = {
	200: {
		description: `
			The possibly-paginated list of user cookie sessions.
		`,
	},
}

export const security = [
	[
		{
			type: cookie,
			authorize,
			scopes: [],
		},
	],
]

export const handler = async (services, req) => {
	const { data, offsetKey } = await listSessionsByUserId(services, {
		userId: req.currentUserId,
		limit: req.params.page && req.params.page.limit,
		offsetKey: req.params.page && req.params.page.offset,
	})
	return {
		status: 200,
		json: true,
		body: {
			data,
			links: paginatedLinks('/v1/sessions', offsetKey, req.params.page && req.params.page.limit, services),
		},
	}
}
