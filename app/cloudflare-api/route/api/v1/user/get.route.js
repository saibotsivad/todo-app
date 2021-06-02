import { name as cookie, authorize } from '@/lib/security/cookie.security.js'
import { user } from '@/lib/tags.js'
import { lookupUserById } from '@/lib/controller/user/lookup-by-id.js'

export const summary = `
	Fetch the [user] object for an authenticated request.
`

export const description = `
	If the request is authenticated, this endpoint will return
	the [user] object associated with the authentication. If the
	request is not authenticated, it will return an error.
`

export const tags = [
	user,
]

export const security = [
	{
		[cookie]: {
			authorize,
		},
	},
]

export const responses = {
	200: {
		description: `
			The complete [user] object of the authenticated
			request.
		`,
	},
	401: {
		description: `
			The request could not be authenticated.
		`,
	},
}

export const handler = async (services, req) => {
	return {
		json: true,
		status: 200,
		body: {
			data: await lookupUserById(services, { userId: req.currentUserId }),
		},
	}
}
