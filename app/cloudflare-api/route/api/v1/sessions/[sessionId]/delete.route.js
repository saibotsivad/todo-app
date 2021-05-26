import { name as cookie, authorize } from '@/lib/security/cookie.js'
import { session } from '@/lib/tags.js'
import { removeUserSession } from '@/lib/controller/session/remove-user-session.js'

export const summary = `
	Delete cookie session.
`

export const description = `
	Delete a specific cookie-based session, for example as part of a users
	audit of their logged in devices.
`

export const tags = [
	session,
]

export const parameters = [
	{
		in: 'path',
		name: 'sessionId',
		description: 'The identifier of the session to delete.',
		required: true,
		schema: {
			type: 'string',
		},
	},
]

export const responses = {
	200: {
		description: `
			The delete request was successful, the session has been deleted
			from the database.
		`,
	},
	401: {
		description: `
			Could not find a cookie session to delete.
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
	await removeUserSession(services, { userId: req.currentUserId, sessionId: req.params.sessionId })
	return {
		status: 200,
		json: true,
		body: { ok: true },
	}
}
