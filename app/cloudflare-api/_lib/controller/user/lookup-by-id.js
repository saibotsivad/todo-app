import { db } from '@/service/dynamodb.js'
import { get } from '@/service/variables.js'

export default async ({ id }) => {
	const { data } = await db('GetItem', {
		TableName: get('TJ_TABLE_NAME'),
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
		meta: {
			created: data.Item.c.S,
			updated: data.Item.u.S
		},
		attributes: {
			email: data.Item.email.S,
			password: data.Item.password.S
		}
	}
}
