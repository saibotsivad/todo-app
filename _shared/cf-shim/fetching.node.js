import got from 'got'

export const fetching = async (_, options) => got(
	Object.assign(
		{},
		options,
		{ throwHttpErrors: false },
	),
).then(response => {
	response.json = async () => JSON.parse(response.body)
	return response
})
