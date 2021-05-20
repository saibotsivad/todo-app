export const removeUserSession = async ({ db, config }, { userId, sessionId }) => {
	await db('DeleteItem', {
		TableName: config.get('TJ_TABLE_NAME'),
		Key: {
			pk: {
				S: `user|${userId}`,
			},
			sk: {
				S: `session|${sessionId}`,
			},
		},
	})
}
