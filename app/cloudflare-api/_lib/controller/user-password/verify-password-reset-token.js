import { validatePassword } from '@/shared/worker-passwords/main.node.js'

export const verifyPasswordResetToken = async ({ db, config, SDate }, { userId, tokenId, tokenSecret }) => {
	const { data } = await db('GetItem', {
		TableName: config.get('DYNAMODB_TABLE_NAME'),
		Key: {
			pk: {
				S: `user|${userId}`,
			},
			sk: {
				S: `pwreset|${tokenId}`,
			},
		},
	})

	const invalidOrExpired = !data
		|| !data.Item
		|| !data.Item.pw
		|| !data.Item.pw.S
		|| !data.Item.e
		|| !data.Item.e.S
		|| SDate.now() > new SDate(data.Item.e.S).getTime()
	if (invalidOrExpired) {
		return null
	}

	return validatePassword({
		hash: data.Item.pw.S,
		password: tokenSecret,
	})
}
