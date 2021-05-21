export const getUserSession = async ({ db, config }, { userId, sessionId }) => {
	const { data } = await db('GetItem', {
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

	return !data || !data.Item
		? null
		: {
			id: data.Item.sk.S.split('|').pop(),
			type: 'session',
			attributes: {
				password: data.Item.pw && data.Item.pw.S,
				status: data.Item.status.S,
			},
			meta: {
				created: data.Item.c.S,
				updated: data.Item.c.S,
				expiration: data.Item.e.S,
			},
		}
}
