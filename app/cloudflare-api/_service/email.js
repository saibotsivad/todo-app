import { fetching } from '@/shared/cf-shim/fetching.node.js'

let generateRequest
let extract

export const ses = options => async (action, parameters) => {

	if (!generateRequest) {
		const { awsSes, extractResponse } = await import('@saibotsivad/aws-ses')
		extract = extractResponse
		const credentials = {
			region: options.get('AWS_REGION'),
			secretAccessKey: options.get('AWS_SECRET_ACCESS_KEY'),
			accessKeyId: options.get('AWS_ACCESS_KEY_ID'),
		}
		if (!credentials.region || !credentials.secretAccessKey || !credentials.accessKeyId) {
			throw Error('AWS credentials not loaded.')
		}
		generateRequest = awsSes({
			credentials: {
				region: process.env.AWS_REGION,
				accessKeyId: process.env.AWS_ACCESS_KEY_ID,
				secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
			},
		})
	}

	const { url, headers, body } = await generateRequest(action, parameters)
	const response = await fetching(url, { headers, body, method: 'POST' })

	return {
		success: response.statusCode === 200,
		data: extract(await response.text()),
	}
}
