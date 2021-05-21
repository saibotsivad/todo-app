export const expireUserSession = async ({ db, config, SDate }, { userId, sessionId }) => {
	const now = new SDate().toISOString()
	await db('UpdateItem', {
		TableName: config.get('TJ_TABLE_NAME'),
		Key: {
			pk: {
				S: `user|${userId}`,
			},
			sk: {
				S: `session|${sessionId}`,
			},
		},
		ExpressionAttributeNames: {
			'#PASSWORD': 'pw',
			'#EXPIRATION': 'e',
			'#STATUS': 'status',
			'#UPDATED': 'u',
		},
		ExpressionAttributeValues: {
			':password': {
				BOOL: false,
			},
			':expiration': {
				S: now,
			},
			':status': {
				S: 'i', // i = inactive
			},
			':updated': {
				S: now,
			},
		},
		UpdateExpression: 'SET #PASSWORD = :password, #EXPIRATION = :expiration, #STATUS = :status, #UPDATED = :updated',
	})
}
