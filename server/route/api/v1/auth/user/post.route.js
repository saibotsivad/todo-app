import { BadRequest } from 'lib/exceptions.js'
import { auth } from 'lib/tags.js'
import createUser from 'lib/controller/user/create-user.js'

export const summary = `
	Create a new [user] object.
`

export const description = `
	If the email is not already claimed, this endpoint will create a new
	[user] object in an unconfirmed state, and will send an email to that
	address containing a link (with a single-use token) used to verify
	ownership of that address.

	If the email is already used, an error will be returned.
`

export const tags = [
	auth
]

export const parameters = [
	{
		in: 'body',
		name: 'body',
		description: 'The user creation parameters.',
		required: true,
		schema: {
			type: 'object',
			properties: {
				email: {
					type: 'string',
					required: true
				},
				password: {
					type: 'string',
					required: true
				}
			}
		}
	}
]

export const responses = {
	200: {
		description: `
			The request succeeded and an email will be sent.
		`
	},
	400: {
		description: `
			The email provided was considered invalid or already exists.
		`
	}
}

export const handler = async (req, res) => {
	const { email, password } = req.body || {}
	if (!email || !password) {
		throw new BadRequest('Email and password must be supplied to create an account.')
	}
	res.statusCode = 201
	res.setHeader('Content-Type', 'application/json')
	res.end(JSON.stringify({
		data: await createUser({ email, password })
	}))
}
