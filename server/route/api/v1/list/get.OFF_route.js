import { name as cookie } from 'security/cookie.js'
import { db } from 'service/dynamodb.js'
import dynamodbListToJsonApiList from 'lib/dynamodb-list-to-json-api-list.js'

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
		scopes: []
	}
]

export const handler = async (req, res) => {
	const userId = '001' // TODO from security stuff

	res.setHeader('Content-Type', 'application/json')
	res.end(dynamodbListToJsonApiList(await db('Query', {
		TableName: process.env.TJ_TABLE_NAME,
		ExpressionAttributeValues: {
			':pk': {
				S: `list|${userId}`
			}
		},
		KeyConditionExpression: 'pk = :pk'
	})))
}
