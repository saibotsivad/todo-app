import { db } from 'service/dynamodb.js'

export default async ({ email }) => {
	const { data } = await db('GetItem', {
		TableName: process.env.TABLE_NAME,
		Key: {
			pk: {
				S: `email|${(email || '').toLowerCase()}`
			},
			sk: {
				S: 'email'
			}
		}
	})

	if (!data || !data.Item) {
		return null
	}

	return {
		id: data.Item.userId.S,
		type: 'user',
		attributes: {
			email: data.Item.pk.S.split('|')[1],
			password: data.Item.password.S
		},
		meta: {
			created: data.Item.c.S,
			updated: data.Item.c.S
		}
	}
}
