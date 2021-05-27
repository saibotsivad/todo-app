import got from 'got'

const intercept = (...args) => {
	// console.log('making a request using `got`:', ...args)
	return got(...args)
}

export const fetching = async (url, options) => intercept(
	Object.assign(
		{ url },
		options,
		{ throwHttpErrors: false },
	),
).then(response => {
	response.json = async () => JSON.parse(response.body)
	response.text = async () => response.body
	return response
})
