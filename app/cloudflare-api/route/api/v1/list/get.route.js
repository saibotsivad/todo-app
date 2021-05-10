import { name as cookie, authorize } from '@/lib/security/cookie.js'
import dynamodbListToJsonApiList from '@/lib/dynamodb-list-to-json-api-list.js'

export const summary = `
	Fetch \`list\` objects.
`

export const description = `
	Retrieve a set of \`list\` objects owned by the authenticated user.
`

export const tags = [
	'list'
]

export const responses = {
	200: {
		description: `
			The set of \`list\` objects owned by the authenticated
			request.
		`
	},
	401: {
		description: `
			The request could not be authenticated.
		`
	}
}

export const security = [
	{
		type: cookie,
		authorize,
		scopes: []
	}
]

export const handler = async ({ db, config }, req, res) => {
	res.setHeader('Content-Type', 'application/json')
	res.end(dynamodbListToJsonApiList(await db('Query', {
		TableName: config.get('TJ_TABLE_NAME'),
		ExpressionAttributeValues: {
			':pk': {
				S: `list|${req.currentUserId}`
			}
		},
		KeyConditionExpression: 'pk = :pk'
	})))
}
