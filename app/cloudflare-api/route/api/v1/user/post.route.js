import { BadRequest } from '@/lib/exceptions.js'
import { auth, session, user } from '@/lib/tags.js'
import { createUser } from '@/lib/controller/user/create-user.js'
import { generateCookie } from '@/lib/cookie.js'
import { sendEmailTemplate } from '@/lib/controller/email-template/send-email-template.js'
import { createUserSession } from '@/lib/controller/session/create-user-session.js'
import { USER_CREATED } from '@/lib/controller/email-template/static/_template-ids.js'

export const summary = `
	Create a new [user] object.
`

export const description = `
	If the email is not already claimed, this endpoint will create a new
	[user] object in an unconfirmed state, and will send an email to that
	address containing a link (with a single-use token) used to verify
	ownership of that address.

	A cookie session will be created for this user, giving them access to
	the website, and that session will be set on the response headers.

	If the email is already in use, an error will be returned.
`

export const tags = [
	auth,
	session,
	user,
]

export const parameters = [
	{
		in: 'body',
		name: 'body',
		description: 'The user creation parameters.',
		required: true,
		schema: {
			type: 'object',
			properties: {
				email: {
					type: 'string',
					required: true,
				},
				password: {
					type: 'string',
					required: true,
				},
			},
		},
	},
]

export const responses = {
	200: {
		description: `
			The request succeeded and an email will be sent.
		`,
	},
	400: {
		description: `
			The email provided was considered invalid or already exists.
		`,
	},
}

export const handler = async (services, req) => {
	const { email, password } = req.body || {}
	if (!email || !password) {
		throw new BadRequest('Email and password must be supplied to create an account.')
	}

	const user = await createUser(services, { email, password })

	const sentEmail = await sendEmailTemplate(services, {
		fromAddress: services.config.get('ADMIN_EMAIL_ADDRESS'),
		toAddress: email,
		subject: 'Welcome to the Todo Journal 🎉',
		templateId: USER_CREATED,
		parameters: {
			baseUrl: services.config.get('BASE_URL'),
			user,
			requestId: req.id,
		},
	})

	const { sessionId, sessionSecret, expirationDate } = await createUserSession(services, { userId: user.id })

	return {
		headers: {
			'Set-Cookie': generateCookie(services, {
				userId: user.id,
				sessionId,
				sessionSecret,
				expirationDate,
			}),
		},
		json: true,
		status: 201,
		body: {
			data: user,
			included: [
				{
					id: sentEmail.id,
					type: sentEmail.type,
					meta: sentEmail.meta,
				},
			],
		},
	}
}
