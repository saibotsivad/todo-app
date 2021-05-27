export const putEmailTemplate = async ({ config, db, SDate }, { id, attributes: { parameters, view } }) => {

	const now = new SDate().toISOString()
	const u = { S: now } // updated

	await db('PutItem', {
		TableName: config.get('DYNAMODB_TABLE_NAME'),
		Item: {
			pk: {
				S: `system`,
			},
			sk: {
				S: `emailtemplate|${id}`,
			},
			parameters: {
				S: JSON.stringify(parameters),
			},
			view: {
				S: view,
			},
			u,
		},
	})

	return {
		id,
		type: 'emailtemplate',
		meta: {
			updated: now,
		},
		attributes: {
			parameters,
			view,
		},
	}
}
