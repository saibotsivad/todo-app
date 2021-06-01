import { auth } from '@/lib/tags.js'
import { BadRequest, NotFound } from '@/lib/exceptions.js'
import { sendEmailTemplate } from '@/lib/controller/email-template/send-email-template.js'
import { createUserPasswordResetToken } from '@/lib/controller/user-password/create-password-reset-token.js'
import { lookupUserByEmail } from '@/lib/controller/user/lookup-by-email.js'
import { stringToBase64Url } from '@/shared/util/string.js'
import { FORGOT_PASSWORD } from '@/lib/controller/email-template/static/_template-ids.js'

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
	if (!user) {
		throw new NotFound('Could not locate user by email address provided.')
	}

	const { tokenId, tokenSecret } = await createUserPasswordResetToken(services, { userId: user.id }) || {}

	const sentEmail = await sendEmailTemplate(services, {
		fromAddress: services.config.get('ADMIN_EMAIL_ADDRESS'),
		toAddress: email,
		subject: 'Password reset requested?',
		templateId: FORGOT_PASSWORD,
		parameters: {
			baseUrl: services.config.get('BASE_URL'),
			tokenUrl: `${services.config.get('BASE_URL')}#/passwordReset?token=${stringToBase64Url(JSON.stringify({ i: tokenId, s: tokenSecret, u: user.id }))}`,
			requestId: req.id,
		},
	})

	return {
		json: true,
		status: 201,
		body: {
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
