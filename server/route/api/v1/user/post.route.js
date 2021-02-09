export const summary = `
	Create a new \`user\` object.
`

export const description = `
	Create a new \`user\` object by initiating an email verification
	flow. An email will be sent with a single-use token in the URL,
	which is then used to activate the \`user\` object.

	If the email is already used, an email will be sent that has a
	single-use token used for logging in.
`

export const tags = [
	'user'
]

export const responses = {
	200: {
		description: `
			The request succeeded and an email will be sent.
		`
	},
	400: {
		description: `
			The email provided was considered invalid.
		`
	}
}

export const handler = async (req, res) => {
	// console.log('request user', req.currentUser)
	// res.end(`the user was ${req.currentUser ? '' : 'not '} found`)
	res.end(JSON.stringify({
		data: {
			id: '001',
			type: 'user',
			attributes: {
				firstName: 'John',
				lastName: 'Jingleheimerschmidt'
			}
		}
	}))
}
