export const name = 'cookie'

export const handler = async () => {
	//
}

function authorize(req, res, next) {
	// mutate req; available later
	req.token = req.headers['authorization']
	req.token
		? next()
		: ((res.statusCode=401) && res.end('No token!'))
}
