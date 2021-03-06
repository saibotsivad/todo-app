import { UnauthorizedRequest } from '@/lib/exceptions.js'
import { parseCookie } from '@/lib/cookie.js'
import { validatePassword } from '@/shared/worker-passwords/main.node.js'
import { getUserSession } from '@/lib/controller/session/get-user-session.js'

export const name = 'cookie'

export const definition = {
	type: 'apiKey',
	name: 'cookie',
	in: 'header',
}

/**
 * Fetch a session from the database using the session information
 * unpacked from the cookie.
 *
 * @param {object} services - The services object.
 * @param {object} request - The request object.
 * @returns {Promise<void>} - The request is mutated or an error is thrown.
 */
export const authorize = async (services, request) => {
	let valid = false

	const { userId, sessionId, sessionSecret } = parseCookie(request.headers.cookie) || {}
	if (userId && sessionId && sessionSecret) {
		const session = await getUserSession(services, { userId, sessionId })
		if (session) {
			const validSessionSecret = await validatePassword({
				hash: session.attributes.password,
				password: sessionSecret,
			})
			const activeSession = session.attributes.status === 'a'
			if (validSessionSecret && activeSession && new Date(session.meta.expiration).getTime() > Date.now()) {
				valid = true
			}
		}
	}

	if (valid) {
		request.currentUserId = userId
		request.currentUserSessionId = sessionId
	} else {
		throw new UnauthorizedRequest('Could not locate or parse cookie.')
	}
}
