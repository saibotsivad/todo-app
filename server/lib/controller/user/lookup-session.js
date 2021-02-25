import { db } from 'service/dynamodb.js'

export default async ({ userId, sessionId, sessionSecret }) => {
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
		id: data.Item.userId.S,
		type: 'session',
		attributes: {
			email: data.Item.pk.S.split('|')[1],
			userId
		},
		meta: {
			created: data.Item.c.S,
			updated: data.Item.c.S
		}
	}
}
