export default {
	id: {
		type: 'string'
	},
	type: {
		type: 'string',
		value: 'user',
		required: true
	},
	created: {
		type: 'date'
	},
	updated: {
		type: 'date'
	},
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
