import { db } from 'service/dynamodb.js'

export default async ({ email }) => {
	const { data, status } = await db('GetItem', {
		TableName: process.env.TABLE_NAME,
		Key: {
			pk: {
				S: 'email'
			},
			sk: {
				S: `email|${(email || '').toLowerCase()}`
			}
		}
	})
	return data && data.Item || null
}
