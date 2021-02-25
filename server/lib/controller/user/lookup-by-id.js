import { db } from 'service/dynamodb.js'

export default async ({ id }) => {
	const { data, status } = await db('GetItem', {
		TableName: process.env.TABLE_NAME,
		Key: {
			pk: {
				S: `user|${id}`
			},
			sk: {
				S: 'user'
			}
		}
	})

	if (!data || !data.Item) {
		return null
	}

	return {
		id,
		type: 'user',
		attributes: {
			// email: data.Item.pk.S.split('|')[1],
			// password: data.Item.pw.S
		},
		meta: {
			created: data.Item.c.S,
			updated: data.Item.c.S
		}
	}
}
