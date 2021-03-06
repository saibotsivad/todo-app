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
			},
			status: {
				type: 'enum',
				required: true,
				values: [
					'a', // active
					'n', // not yet active
					'e', // expired, aka was previously active but is no longer
				]
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
