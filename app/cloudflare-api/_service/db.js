import { createAwsSigner } from 'sign-aws-requests'
import { DatabaseValidation } from '@/lib/exceptions.js'
import { fetching } from '@/shared/cf-shim/fetching.node.js'

let sign

export const dynamodb = options => async (type, params) => {
	// This is lazy instantiation, but it still imports even if
	// you never use DynamoDB. So far all the Lambda functions
	// use DynamoDB so this is fine, but if there's ever a Lambda
	// function that doesn't, this will need to be revisited.
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
		// awsClient = got.extend({
		// 	hooks: {
		// 		beforeRequest: [
		// 			async options => {
		// 				const { authorization } = await sign(options)
		// 				options.headers.Authorization = authorization
		// 			}
		// 		]
		// 	}
		// })
	}

	const request = {
		url: `https://dynamodb.${options.get('AWS_REGION')}.amazonaws.com`,
		method: 'POST',
		headers: {
			'content-type': 'application/x-amz-json-1.0',
			'X-Amz-Target': `DynamoDB_20120810.${type}`,
			Host: `dynamodb.${options.get('AWS_REGION')}.amazonaws.com`,
		},
		retry: {
			limit: 0,
		},
		throwHttpErrors: false,
		body: JSON.stringify(params),
	}
	const { authorization } = await sign(request)
	request.headers.Authorization = authorization

	const response = await fetching(`https://dynamodb.${options.get('AWS_REGION')}.amazonaws.com`, request)
	const data = await response.json()

	if (response.statusCode !== 200 && data.__type) {
		if (data.__type.includes('#ValidationException')) {
			throw new DatabaseValidation('Invalid parameters given to DynamoDB call.', { stacktrace: data.message })
		}
	}

	return {
		data,
		status: response.statusCode,
	}
}
