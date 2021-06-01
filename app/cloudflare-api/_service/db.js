import { createAwsSigner } from 'sign-aws-requests'
import { DatabaseValidation } from '@/lib/exceptions.js'
import { fetching } from '@/shared/cf-shim/fetching.node.js'

let sign

export const dynamodb = options => async (type, params) => {
	if (!sign) {
		const config = {
			service: 'dynamodb',
			region: options.get('AWS_REGION'),
			secretAccessKey: options.get('AWS_SECRET_ACCESS_KEY'),
			accessKeyId: options.get('AWS_ACCESS_KEY_ID'),
		}
		if (!config.region || !config.secretAccessKey || !config.accessKeyId) {
			throw Error('AWS credentials not loaded.')
		}
		sign = createAwsSigner({ config })
	}

	const request = {
		url: options.get('DYNAMODB_URL') || `https://dynamodb.${options.get('AWS_REGION')}.amazonaws.com`,
		method: 'POST',
		headers: {
			'content-type': 'application/x-amz-json-1.0',
			'X-Amz-Target': `DynamoDB_20120810.${type}`,
			Host: options.get('DYNAMODB_URL')
				? 'localhost'
				: `dynamodb.${options.get('AWS_REGION')}.amazonaws.com`,
		},
		body: JSON.stringify(params),
	}
	const { authorization } = await sign(request)
	request.headers.Authorization = authorization

	const response = await fetching(
		request.url,
		{
			headers: request.headers,
			method: request.method,
			body: request.body,
		},
	)
	const data = await response.json()

	if (response.status !== 200 && data.__type) {
		if (data.__type.includes('#ValidationException')) {
			throw new DatabaseValidation('Invalid parameters given to DynamoDB call.', { request, response: data })
		}
	}

	return {
		data,
		status: response.status,
	}
}
