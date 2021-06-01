import { fetching } from '@/shared/cf-shim/fetching.node.js'

let generateRequest
let extract

export const ses = options => async (action, parameters) => {
	if (options.get('LOCAL_SES_FOLDER') && options.ses) {
		return options.ses(action, parameters)
	}

	if (!generateRequest) {
		const { awsSes, extractResponse } = await import('@saibotsivad/aws-ses')
		extract = extractResponse
		generateRequest = awsSes({
			credentials: {
				region: options.get('AWS_REGION'),
				secretAccessKey: options.get('AWS_SECRET_ACCESS_KEY'),
				accessKeyId: options.get('AWS_ACCESS_KEY_ID'),
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
