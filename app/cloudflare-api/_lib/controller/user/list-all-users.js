import { stringToBase64Url, base64UrlToString } from '@/shared/util/string.js'

export const listAllUsers = async ({ db, config }, { limit, offsetKey } = {}) => {
	const query = {
		TableName: config.get('TJ_TABLE_NAME'),
		ExpressionAttributeValues: {
			':pk': {
				S: 'user',
			},
			':sk': {
				S: 'user|',
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

	if (!data || !data.Items || !data.Items.length) {
		return { data: [] }
	}

	return {
		data: data.Items.map(item => ({
			id: item.sk.S.split('|').pop(),
			type: 'user',
			meta: {
				created: item.c.S,
				updated: item.u.S,
			},
			attributes: {
				email: item.email.S,
			},
		})),
		offsetKey: data.LastEvaluatedKey && stringToBase64Url(JSON.stringify(data.LastEvaluatedKey)),
	}
}
