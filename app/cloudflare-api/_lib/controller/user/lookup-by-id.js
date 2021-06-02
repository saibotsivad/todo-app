export const lookupUserById = async ({ db, config }, { userId }) => {
	const { data } = await db('GetItem', {
		TableName: config.get('DYNAMODB_TABLE_NAME'),
		Key: {
			pk: {
				S: `user|${userId}`,
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
		id: userId,
		type: 'user',
		meta: {
			created: data.Item.c.S,
			updated: data.Item.u.S,
		},
		attributes: {
			email: data.Item.email.S,
			password: data.Item.password.S,
			roles: data.Item.roles.SS,
		},
	}
}
