export const listSessionsByUserId = async ({ db, config }, { userId }) => {
	const { data } = await db('Query', {
		TableName: config.get('TJ_TABLE_NAME'),
		ExpressionAttributeValues: {
			':pk': {
				S: `user|${userId}`,
			},
			':sk': {
				S: 'session|',
			},
		},
		KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
	})

	return {
		data: !data || !data.Items || !data.Items.length
			? []
			: data.Items.map(item => ({
				id: item.sk.S.split('|').pop(),
				type: 'session',
				attributes: {
					password: item.pw.S,
					status: item.status.S,
					userId,
				},
				meta: {
					created: item.c.S,
					updated: item.c.S,
					expiration: item.e.S,
				},
			})),
	}
}
