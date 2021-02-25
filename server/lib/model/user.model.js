export default {
	id: {
		type: 'string'
	},
	type: {
		type: 'string',
		value: 'user',
		required: true
	},
	attributes: {
		type: 'object',
		properties: {
			activated: {
				type: 'boolean'
			},
			email: {
				type: 'string',
				required: true
			},
			password: {
				type: 'string',
				required: true
			}
		}
	},
	meta: {
		type: 'object',
		properties: {
			created: {
				type: 'date'
			},
			updated: {
				type: 'date'
			}
		}
	}
}
