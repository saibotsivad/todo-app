export const getEmailTemplate = async ({ config, db }, { id }) => {
	const { data } = await db('GetItem', {
		TableName: config.get('DYNAMODB_TABLE_NAME'),
		Key: {
			pk: {
				S: `system`,
			},
			sk: {
				S: `emailtemplate|${id}`,
			},
		},
	})

	if (!data || !data.Item) {
		return null
	}

	return {
		id,
		type: 'emailtemplate',
		meta: {
			updated: data.Item.u.S,
		},
		attributes: {
			parameters: JSON.parse(data.Item.parameters.S),
			view: data.Item.view.S,
		},
	}
}
