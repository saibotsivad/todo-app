import { auth } from '@/lib/tags.js'
import { BadRequest } from '@/lib/exceptions.js'
import { sendEmail } from '@/service/email.js'
import { createUserPasswordResetToken } from '@/lib/controller/user-password/create-password-reset-token.js'
import { lookupUserByEmail } from '@/lib/controller/user/lookup-by-email.js'
import renderEmailTemplate from '@/lib/render-email-template.js'
import { stringToBase64Url } from '@/shared/util/string.js'

export const summary = `
	Send password reset email.
`

export const description = `
	Send an email containing a password reset link. The link contains a single-use, date-expiring
	token which grants the holder the ability to reset the password of the provided email account.
`

export const tags = [
	auth,
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
					required: true,
				},
			},
		},
	},
]

export const responses = {
	201: {
		description: `
			The password reset request was a success. A password reset
			email has been sent to the provided email address. No other
			information will be returned.
		`,
	},
	400: {
		description: `
			The email was not supplied.
		`,
	},
	401: {
		description: `
			The password reset request could not be completed. Either the email
			was invalid or could not be associated with an existing account.
		`,
	},
}

export const handler = async (services, req) => {
	const { email } = req.body || {}
	if (!email) {
		throw new BadRequest('Email must be supplied to send password reset  link.')
	}
	const user = await lookupUserByEmail(services, { email })
	const { tokenId, tokenSecret, expirationDate } = user && await createUserPasswordResetToken(services, { userId: user.id }) || {}
	const emailSent = user && await sendEmail(services, {
		fromAddress: services.config.get('TJ_ADMIN_EMAIL_ADDRESS'),
		toAddress: email,
		subject: 'Password reset requested?',
		body: renderEmailTemplate({
			parameters: {
				domain: services.config.get('TJ_API_DOMAIN'),
				token: stringToBase64Url(JSON.stringify({ i: tokenId, s: tokenSecret, u: user.id })),
				expirationDate,
			},
			template: (await import('@/lib/email-templates/forgot-password.md')).default,
		}),
	})
	if (!emailSent) {
		throw new BadRequest('Could not send password reset link to provided email.')
	}
	return {
		json: true,
		status: 201,
		body: { ok: true },
	}
}
