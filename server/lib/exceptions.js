export class BadRequest extends Error {
	constructor(message, meta) {
		super(message)
		this.status = 400
		this.title = 'Incorrectly formed request, please check the OpenAPI definition.'
		this.detail = message
		this.meta = meta
	}
}

export class DatabaseValidation extends Error {
	constructor(message, meta) {
		super(message)
		this.status = 400
		this.title = 'The data sent to the database was invalid. This is likely a developer error.'
		this.detail = message
		this.meta = meta
	}
}

export class ItemAlreadyExists extends Error {
	constructor(message, meta) {
		super(message)
		this.status = 409
		this.title = 'The item attempting to be created already exists or conflicts.'
		this.detail = message
		this.meta = meta
	}
}

export class UnauthorizedRequest extends Error {
	constructor(message, meta) {
		super(message)
		this.status = 401
		this.title = 'Could not authenticate the request.'
		this.detail = message
		this.meta = meta
	}
}
