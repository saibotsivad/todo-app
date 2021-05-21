import { stringToBase64Url, base64UrlToString } from '@/shared/util/string.js'

export const listSessionsByUserId = async ({ db, config }, { userId, limit, offsetKey }) => {
	const query = {
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
	}
	if (limit) {
		query.Limit = parseInt(limit, 10)
	}
	if (offsetKey) {
		query.ExclusiveStartKey = JSON.parse(base64UrlToString(offsetKey))
	}
	const { data } = await db('Query', query)

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
		offsetKey: data && data.LastEvaluatedKey && stringToBase64Url(JSON.stringify(data.LastEvaluatedKey)),
	}
}
