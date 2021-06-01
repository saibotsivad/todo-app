import { UnauthorizedRequest, ForbiddenRequest } from '@/lib/exceptions.js'
import { parseCookie } from '@/lib/cookie.js'
import { validatePassword } from '@/shared/worker-passwords/main.node.js'
import { getUserSession } from '@/lib/controller/session/get-user-session.js'
import { lookupUserById } from '@/lib/controller/user/lookup-by-id.js'

export const name = 'cookie'

/**
 * Fetch a session from the database using the session information
 * unpacked from the cookie.
 *
 * @param {object} services - The services object.
 * @param {object} request - The request object.
 * @param {Array} [scopes] - List of scopes the route requires. Setting this will load the [user] from the database and set it on [request.currentUser].
 * @returns {Promise<void>} - The request is mutated or an error is thrown.
 */
export const authorize = async (services, request, scopes) => {
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
		if (scopes && scopes.length) {
			request.currentUser = await lookupUserById(services, { userId })
			const userScopes = request.currentUser.attributes.scopes || []
			const hasScopePermission = scopes.every(scope => userScopes.includes(scope))
			if (!hasScopePermission) {
				throw new ForbiddenRequest('User does not have sufficient scope permissions.', {
					requiredScopes: scopes,
					userScopes,
				})
			}
		}
		request.currentUserId = userId
		request.currentUserSessionId = sessionId
	} else {
		throw new UnauthorizedRequest('Could not locate or parse cookie.')
	}
}
