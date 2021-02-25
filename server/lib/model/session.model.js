export default {
	id: {
		type: 'string'
	},
	type: {
		type: 'string',
		value: 'session',
		required: true
	},
	attributes: {
		type: 'object',
		properties: {
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
			},
			expiration: {
				type: 'date'
			}
		}
	}
}
