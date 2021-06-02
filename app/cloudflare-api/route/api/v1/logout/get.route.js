import { name as cookie, authorize } from '@/lib/security/cookie.security.js'
import { auth, session } from '@/lib/tags.js'
import { generateExpiredCookie } from '@/lib/cookie.js'
import { expireUserSession } from '@/lib/controller/session/expire-user-session.js'

export const summary = `
	Expire current cookie session.
`

export const description = `
	If a cookie is set on the request, e.g. for normal browser sessions, that cookie's
	session will be deactivated and the cookie will be sent back as expired.
`

export const tags = [
	auth,
	session,
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
			The logout request was a success. The session has been expired
			and a cookie header has been set which expires the session in
			the users browser. Note that if no valid session is found, a 401
			will be returned.
		`,
	},
	401: {
		description: `
			Could not find a valid cookie session to expire or invalidate.
		`,
	},
}

export const handler = async (services, req) => {
	await expireUserSession(services, { userId: req.currentUserId, sessionId: req.currentUserSessionId })
	return {
		headers: {
			'Set-Cookie': generateExpiredCookie(services),
		},
		status: 200,
		json: true,
		body: { ok: true },
	}
}
