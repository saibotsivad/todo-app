export default {
	type: 'object',
	required: [
		'type',
	],
	properties: {
		id: {
			type: 'string',
		},
		type: {
			type: 'string',
			value: 'session',
		},
		attributes: {
			type: 'object',
			required: [
				'password',
				'status',
			],
			properties: {
				password: {
					type: 'string',
				},
				status: {
					enum: [
						'a', // active
						'n', // not yet active
						'e',  // expired, aka was previously active but is no longer
					],
				},
			},
		},
		meta: {
			type: 'object',
			properties: {
				created: {
					type: 'string',
					format: 'date-time',
				},
				updated: {
					type: 'string',
					format: 'date-time',
				},
				expiration: {
					type: 'string',
					format: 'date-time',
				},
			},
		},
	},
}
