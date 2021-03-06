import { db } from 'service/dynamodb.js'

export default async ({ userId, sessionId }) => {
	const { data, status } = await db('SetItem', {
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
}
