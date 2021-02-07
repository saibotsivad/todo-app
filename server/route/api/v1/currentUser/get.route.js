export const summary = `
	Fetch \`user\` object for authenticated request.
`

export const description = `
	Retrieve the \`user\` object for the authenticated
	request, or throw an error if not authenticated.
`

export const tags = [
	'user'
]

export const responses = {
	200: {
		description: `
			The complete \`user\` object of the authenticated
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
	{ cookie: [] }
]

export const handler = async (req, res) => {
	console.log('hello?')
	// console.log('request user', req.currentUser)
	// res.end(`the user was ${req.currentUser ? '' : 'not '} found`)
	res.end('hello?')
}
