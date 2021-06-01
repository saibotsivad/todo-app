export const lookupSentEmailById = async ({ db, config }, { sentEmailId }) => {
	const { data } = await db('GetItem', {
		TableName: config.get('DYNAMODB_TABLE_NAME'),
		Key: {
			pk: {
				S: 'sentEmail',
			},
			sk: {
				S: `sentEmail|${sentEmailId}`,
			},
		},
	})

	if (!data || !data.Item) {
		return null
	}

	return {
		id: sentEmailId,
		type: 'sentEmail',
		meta: {
			created: data.Item.c.S,
		},
		attributes: {
			fromAddress: data.Item.fromAddress.S,
			toAddress: data.Item.toAddress.S,
			html: data.Item.html.S,
			markdown: data.Item.markdown.S,
			parameters: data.Item.fromAddress.M,
			templateId: data.Item.templateId.S,
		},
	}
}
