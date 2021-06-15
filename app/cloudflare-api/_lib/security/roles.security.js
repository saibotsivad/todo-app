import { ForbiddenRequest } from '@/lib/exceptions.js'
import { lookupUserById } from '@/lib/controller/user/lookup-by-id.js'

let renderView

export const name = 'roles'

export const definition = {
	type: 'apiKey',
	name: 'roles',
	in: 'header',
}

/**
 * Using a cookie session or API token, fetch that users roles and verify the user has
 * sufficient privileges to make this request.
 *
 * @param {object} services - The services object.
 * @param {object} request - The request object.
 * @param {Array} routeRequiredRoles - List of roles the route requires. If the requesting user is not
 *     loaded yet, this will load the [user] from the database and set it on [request.currentUser].
 * @returns {Promise<void>} - The request is mutated or an error is thrown.
 */
export const authorize = async (services, request, routeRequiredRoles) => {
	if (!routeRequiredRoles || !routeRequiredRoles.length) {
		throw new Error('The defined route requires roles but has not defined any. This is a developer error.')
	}
	if (!request.currentUserId) {
		throw new Error('The roles security block requires an authorization block prior to it which sets the requesting user id. This is a developer error.')
	}
	// TODO is this correct? I would think the request would be new each time
	if (request.currentUser) {
		throw new Error('The current user is already loaded. How did that happen?????' + JSON.stringify(request.currentUser))
	}

	request.currentUser = request.currentUser || await lookupUserById(services, { userId: request.currentUserId })

	if (!renderView) {
		const templite = await import('templite')
		renderView = templite.default
	}

	const requiredRoleUrns = routeRequiredRoles.map(({ urn }) => renderView(urn, request))

	const userRoles = request.currentUser.attributes.roles || []
	const hasRolePermission = requiredRoleUrns.every(urn => userRoles.includes(urn))
	if (!hasRolePermission) {
		throw new ForbiddenRequest('User does not have sufficient role permissions.', {
			routeRequiredRoles,
			requiredRoleUrns,
			userRoles,
		})
	}
}
