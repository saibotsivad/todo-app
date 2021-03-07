import { createAwsSigner } from 'sign-aws-requests'
import got from 'got'

let awsClient

export const db = async (type, params) => {
	// lazy instantiation
	if (!awsClient) {
		const config = {
			service: 'dynamodb',
			region: process.env.AWS_REGION,
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
			accessKeyId: process.env.AWS_ACCESS_KEY_ID
		}
		if (!config.region || !config.secretAccessKey || !config.accessKeyId) {
			throw Error('AWS credentials not loaded.')
		}
		const sign = createAwsSigner({ config })
		awsClient = got.extend({
			hooks: {
				beforeRequest: [
					async options => {
						const { authorization } = await sign(options)
						options.headers.Authorization = authorization
					}
				]
			}
		})
	}

	const request = {
		url: `https://dynamodb.${process.env.AWS_REGION}.amazonaws.com`,
		method: 'POST',
		headers: {
			'content-type': 'application/x-amz-json-1.0',
			'X-Amz-Target': `DynamoDB_20120810.${type}`,
			Host: `dynamodb.${process.env.AWS_REGION}.amazonaws.com`
		},
		retry: {
			limit: 0
		},
		throwHttpErrors: false,
		body: JSON.stringify(params)
	}
	const response = await awsClient(request)
	const data = JSON.parse(response.body)
	return {
		data,
		status: response.statusCode
	}
}
