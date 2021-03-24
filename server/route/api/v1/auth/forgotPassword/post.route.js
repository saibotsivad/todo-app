import { auth } from 'lib/tags.js'
import { BadRequest } from 'lib/exceptions.js'
import { generateCookie } from 'lib/cookie.js'
import { validatePassword } from 'lib/password.js'
import createUserSession from 'lib/controller/user/create-user-session.js'
import lookupByEmail from 'lib/controller/user/lookup-by-email.js'

export const summary = `
	Send password reset email.
`

export const description = `
	Send an email containing a password reset link.
	TODO: describe flow
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
				}
			}
		}
	}
]

export const responses = {
	201: {
		description: `
			The password reset request was a success. A password reset
			email has been sent to the provided email address. No other
			information will be returned.
		`
	},
	400: {
		description: `
			The email was not supplied.
		`
	},
	401: {
		description: `
			The password reset request could not be completed. Either the email
			was invalid or could not be associated with an existing account.
		`
	}
}

export const handler = async (req, res) => {
	const { email } = req.body || {}
	if (!email) {
		throw new BadRequest('Email must be supplied to send password reset link.')
	}
	const user = await lookupByEmail({ email })
	const emailSent = user && await sendEmail({
		fromAddress: process.env.ADMIN_EMAIL_ADDRESS,
		toAddress: email,
		subject,
		body
	})
	if (!emailSent) {
		throw new BadRequest('Could not send password reset link to provided email.')
	}
	return {
		json: true,
		status: 201,
		body: { ok: true }
	}
}
