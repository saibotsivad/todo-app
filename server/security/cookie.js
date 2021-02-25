import { UnauthorizedRequest } from 'lib/exceptions.js'
import { parseCookie } from 'lib/cookie.js'

export const name = 'cookie'

export const authorize = async req => {
	const { userId, sessionId, sessionSecret } = parseCookie(req.headers.cookie) || {}
	if (!userId || !sessionId || !sessionSecret) {
		throw new UnauthorizedRequest('Could not locate or parse cookie.')
	}
	const session = await lookupSession({ userId, sessionId, sessionSecret })
	req.currentUserId = userId
}
