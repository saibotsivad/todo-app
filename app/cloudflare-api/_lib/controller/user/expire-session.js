import { db } from '@/service/dynamodb.js'
import { get } from '@/service/variables.js'

export default async ({ userId, sessionId }) => {
	const now = new Date().toISOString()

	const { data, status } = await db('UpdateItem', {
		TableName: get('TJ_TABLE_NAME'),
		Key: {
			pk: {
				S: `user|${userId}`
			},
			sk: {
				S: `session|${sessionId}`
			}
		},
		ExpressionAttributeNames: {
			'#PASSWORD': 'pw',
			'#EXPIRATION': 'e',
			'#STATUS': 'status',
			'#UPDATED': 'u'
		},
		ExpressionAttributeValues: {
			':password': {
				BOOL: false
			},
			':expiration': {
				S: now
			},
			':status': {
				S: 'i' // i = inactive
			},
			':updated': {
				S: now
			}
		},
		UpdateExpression: 'SET #PASSWORD = :password, #EXPIRATION = :expiration, #STATUS = :status, #UPDATED = :updated'
	})
	console.log('----------------', status)
	console.log('----------------', data)
}
