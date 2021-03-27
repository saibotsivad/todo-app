import { auth } from 'lib/tags.js'
import { BadRequest } from 'lib/exceptions.js'
import { generateCookie } from 'lib/cookie.js'
import { validatePassword } from 'lib/password.js'
import createUserSession from 'lib/controller/user/create-user-session.js'
import lookupByEmail from 'lib/controller/user/lookup-by-email.js'

export const summary = `
	Email and password login.
`

export const description = `
	Send an email and password, and if authenticated a new session will
	be added for the user, and a \`Set-Cookie\` header returned.
`

export const tags = [
	auth
]

export const parameters = [
	{
		in: 'body',
		name: 'body',
		description: 'The login request parameters.',
		required: true,
		schema: {
			type: 'object',
			properties: {
				email: {
					type: 'string',
					required: true
				},
				password: {
					type: 'string',
					required: true
				}
			}
		}
	}
]

export const responses = {
	201: {
		description: `
			The authentication request was a success. A new session has
			been added for the user, and a cookie header is set. No other
			information will be returned.
		`
	},
	400: {
		description: `
			The email or password were not supplied.
		`
	},
	401: {
		description: `
			The login request could not be authenticated. Either the email
			could not be associated with an existing account, or the given
			password was invalid.
		`
	}
}

export const handler = async (req) => {
	const { email, password } = req.body || {}
	if (!email || !password) {
		throw new BadRequest('Email and password must be supplied to authenticate.')
	}
	const user = await lookupByEmail({ email })
	if (!user || !user.attributes.password) {
		throw new BadRequest('Could not locate valid user by email.')
	}
	if (!(await validatePassword({ hash: user.attributes.password, password }))) {
		throw new BadRequest('Could not validate password.')
	}
	const { sessionId, sessionSecret, expirationDate } = await createUserSession({ user })
	return {
		headers: {
			'Set-Cookie': generateCookie({
				userId: user.id,
				sessionId,
				sessionSecret,
				expirationDate
			})
		},
		json: true,
		status: 201,
		body: { ok: true }
	}
}
