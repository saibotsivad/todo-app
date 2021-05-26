import { auth, session } from '@/lib/tags.js'
import { BadRequest, UnauthorizedRequest } from '@/lib/exceptions.js'
import { base64UrlToString } from '@/shared/util/string.js'
import { createUserSession } from '@/lib/controller/session/create-user-session.js'
import { generateCookie } from '@/lib/cookie.js'
import { resetUserPassword } from '@/lib/controller/user-password/reset-password.js'
import { verifyPasswordResetToken } from '@/lib/controller/user-password/verify-password-reset-token.js'

export const summary = `
	Update password using emailed token.
`

export const description = `
	Using the provided token from the sent email, update the password of the
	email account owner. If the request is successful, a cookie session is also
	created and a \`Set-Cookie\` header is returned on the response.
`

export const tags = [
	auth,
	session,
]

export const parameters = [
	{
		in: 'body',
		name: 'body',
		description: 'The password reset request parameters.',
		required: true,
		schema: {
			type: 'object',
			properties: {
				password: {
					description: 'The updated password.',
					type: 'string',
					required: true,
				},
				token: {
					description: 'The combined token id and secret, as sent via email.',
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
			The password reset was a success. A session token is also created
			and a cookie header is set.
		`,
	},
	400: {
		description: `
			The email or token were not supplied or were not valid.
		`,
	},
	401: {
		description: `
			The password reset request could not be completed. Either the email
			was invalid or could not be associated with an existing account.
		`,
	},
}

const parseToken = string => {
	try {
		const { i, s, u } = JSON.parse(base64UrlToString(string))
		return { tokenId: i, tokenSecret: s, userId: u }
	} catch (ignore) {
		return {}
	}
}

export const handler = async (services, req) => {
	const { password, token } = req.body || {}
	const { tokenId, tokenSecret, userId } = parseToken(token)

	if (!tokenId || !tokenSecret || !userId) {
		throw new BadRequest('Could not parse provided token, maybe the link URL was incorrectly copied?')
	}

	if (!(await verifyPasswordResetToken(services, { userId, tokenId, tokenSecret }))) {
		throw new UnauthorizedRequest('Could not verify the password reset token, maybe the link expired?')
	}

	await resetUserPassword(services, { userId, password })

	const { sessionId, sessionSecret, expirationDate } = await createUserSession(services, { userId })
	return {
		headers: {
			'Set-Cookie': generateCookie(services, {
				userId,
				sessionId,
				sessionSecret,
				expirationDate,
			}),
		},
		json: true,
		status: 201,
		body: { ok: true },
	}
}
