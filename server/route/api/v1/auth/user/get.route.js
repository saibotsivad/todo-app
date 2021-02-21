import { name as cookie } from 'security/cookie.js'
import { auth } from 'lib/tags.js'

export const summary = `
	Fetch the [user] object for an authenticated request.
`

export const description = `
	If the request is authenticated, this endpoint will return
	the [user] object associated with the authentication. If the
	request is not authenticated, it will return an error.
`

export const tags = [
	auth
]

export const responses = {
	200: {
		description: `
			The complete [user] object of the authenticated
			request.
		`
	},
	401: {
		description: `
			The request could not be authenticated.
		`
	}
}

export const security = [
	{
		type: cookie,
		scopes: []
	}
]

export const handler = async (req, res) => {
	// console.log('request user', req.currentUser)
	// res.end(`the user was ${req.currentUser ? '' : 'not '} found`)
	res.end(JSON.stringify({
		data: {
			id: '001',
			type: [user],
			attributes: {
				firstName: 'John',
				lastName: 'Jingleheimerschmidt'
			}
		}
	}))
}