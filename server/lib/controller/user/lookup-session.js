import { db } from 'service/dynamodb.js'

export default async ({ userId, sessionId }) => {
	const { data, status } = await db('GetItem', {
		TableName: process.env.TABLE_NAME,
		Key: {
			pk: {
				S: `user|${userId}`
			},
			sk: {
				S: `session|${sessionId}`
			}
		}
	})

	if (!data || !data.Item) {
		return null
	}

	return {
		id: sessionId,
		type: 'session',
		attributes: {
			password: data.Item.pw && data.Item.pw.S,
			status: data.Item.status.S
		},
		meta: {
			created: data.Item.c.S,
			updated: data.Item.c.S,
			expiration: data.Item.e.S
		}
	}
}
