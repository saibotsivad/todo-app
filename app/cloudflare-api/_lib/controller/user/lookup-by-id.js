export default async ({ db, config }, { id }) => {
	const { data } = await db('GetItem', {
		TableName: config.get('TJ_TABLE_NAME'),
		Key: {
			pk: {
				S: `user|${id}`,
			},
			sk: {
				S: 'user',
			},
		},
	})

	if (!data || !data.Item) {
		return null
	}

	return {
		id,
		type: 'user',
		meta: {
			created: data.Item.c.S,
			updated: data.Item.u.S,
		},
		attributes: {
			email: data.Item.email.S,
			password: data.Item.password.S,
		},
	}
}
