import { name as cookie, authorize } from 'security/cookie.js'
import { auth } from 'lib/tags.js'
import { generateExpiredCookie } from 'lib/cookie.js'
import expireSession from 'lib/controller/user/expire-session.js'

export const summary = `
	Deactivate cookie session.
`

export const description = `
	If a cookie is set, for normal browser sessions, that cookie's session
	will be deactivated and the cookie will be expired.
`

export const tags = [
	auth
]

export const responses = {
	200: {
		description: `
			The logout request was a success. The session has been expired
			and a cookie header has been set which expires the session in
			the users browser. Note that if no valid session is found, a 401
			will be returned.
		`
	},
	401: {
		description: `
			Could not find a valid cookie session to expire or invalidate.
		`
	}
}

export const security = [
	[
		{
			type: cookie,
			authorize,
			scopes: []
		}
	]
]

export const handler = async (req, res) => {
	await expireSession({ userId: req.currentUserId, sessionId: req.currentUserSessionId })
	return {
		headers: {
			'Set-Cookie': generateExpiredCookie()
		},
		json: true,
		body: { ok: true }
	}
}
