import { name as cookie, authorize } from '@/lib/security/cookie.js'
import { sentEmail } from '@/lib/tags.js'
import { lookupSentEmailById } from '@/lib/controller/sent-email/lookup-by-id.js'

export const summary = `
	Fetch a [sentEmail] object.
`

export const description = `
	Fetch the sent email, including the template identifier and also the
	fully rendered markdown and HTML that was actually sent.
`

export const tags = [
	sentEmail,
]

export const parameters = [
	{
		in: 'path',
		name: 'sentEmailId',
		description: 'The identifier of the sent email.',
		required: true,
		schema: {
			type: 'string',
		},
	},
]

export const responses = {
	200: {
		description: `
			The [sentEmail] object.
		`,
	},
	401: {
		description: `
			The request could not be authenticated.
		`,
	},
	403: {
		description: `
			The requesting user does not have permission to view this email.
		`,
	},
	404: {
		description: `
			The email could not be located.
		`,
	},
}

export const security = [
	[
		{
			type: cookie,
			authorize,
			scopes: [
				'read:sentEmails',
			],
		},
	],
]

export const handler = async (services, req) => {
	return {
		json: true,
		status: 200,
		body: {
			data: await lookupSentEmailById(services, { sentEmailId: req.sentEmailId }),
		},
	}
}
