import { createAwsSigner } from 'sign-aws-requests'
import { post } from 'httpie'
import got from 'got'

const config = {
	service: 'dynamodb',
	region: process.env.AWS_REGION,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	accessKeyId: process.env.AWS_ACCESS_KEY_ID
}

const sign = createAwsSigner({ config })

const awsClient = got.extend({
	hooks: {
		beforeRequest: [
			async options => {
				const { authorization } = await sign(options)
				options.headers.Authorization = authorization
			}
		]
	}
})

export const db = async (type, params) => {
	console.log('PARAMS', params)
	const request = {
		url: `https://dynamodb.${config.region}.amazonaws.com`,
		method: 'POST',
		headers: {
			'content-type': 'application/x-amz-json-1.0',
			'X-Amz-Target': `DynamoDB_20120810.${type}`,
			Host: `dynamodb.${config.region}.amazonaws.com`
		},
		body: JSON.stringify(params)
	}
	return awsClient(request)
}
