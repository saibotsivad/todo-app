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
			value: 'user',
		},
		attributes: {
			type: 'object',
			required: [
				'email',
				'password',
			],
			properties: {
				activated: {
					type: 'boolean',
				},
				email: {
					type: 'string',
				},
				password: {
					type: 'string',
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
			},
		},
	},
}
