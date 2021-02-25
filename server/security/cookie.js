import { UnauthorizedRequest } from 'lib/exceptions.js'
import { parseCookie } from 'lib/cookie.js'
import { validatePassword } from 'lib/password.js'
import lookupSession from 'lib/controller/user/lookup-session.js'

export const name = 'cookie'

export const authorize = async req => {
	let valid = false

	const { userId, sessionId, sessionSecret } = parseCookie(req.headers.cookie) || {}
	if (userId && sessionId && sessionSecret) {
		const session = await lookupSession({ userId, sessionId })
		if (session) {
			const validSessionSecret = await validatePassword({
				hash: session.attributes.password,
				password: sessionSecret
			})
			console.log('-------------- valid?', validSessionSecret)
			if (validSessionSecret && new Date(session.meta.expiration).getTime() > Date.now()) {
				valid = true
			}
		}
	}

	if (valid) {
		req.currentUserId = userId
	} else {
		throw new UnauthorizedRequest('Could not locate or parse cookie.')
	}
}
