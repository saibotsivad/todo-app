import { BadRequest } from 'lib/exceptions.js'
import { db } from 'service/dynamodb.js'
import { normalizeEmail } from 'lib/email.js'
import { hashPassword } from 'lib/password.js'
import KSUID from 'ksuid'

const passwordIsPseudoReasonable = password => password.length > 10
	&& /[a-z]/.test(password)
	&& /[0-9]/.test(password)

const userAlreadyExists = data => data
	&& data.CancellationReasons
	&& data.CancellationReasons.find(({ Code }) => Code === 'ConditionalCheckFailed')

class UserAlreadyExists extends Error {
	constructor(message) {
		super(message)
		this.status = 409
		this.title = message
	}
}

export default async ({ email, password }) => {
	if (!passwordIsPseudoReasonable(password)) {
		throw new BadRequest('Passwords must contain at least 8 characters, at least 1 letter, and at least 1 number.')
	}

	const now = new Date().toISOString()
	const c = { S: now } // created
	const u = { S: now } // updated
	const userId = (await KSUID.random()).string
	const hashedPassword = await hashPassword({ password })
	email = normalizeEmail(email)

	// 1. write user to dynamodb

	const { data, status } = await db('TransactWriteItems', {
		TransactItems: [
			// user in user collection
			{
				Put: {
					TableName: process.env.TABLE_NAME,
					Item: {
						pk: {
							S: 'user'
						},
						sk: {
							S: `user|${userId}`
						},
						pw: {
							S: hashedPassword
						},
						c,
						u
					},
					ConditionExpression: 'attribute_not_exists(#PK)',
					ExpressionAttributeNames: {
						'#PK': 'pk'
					},
					ReturnValuesOnConditionCheckFailure: 'NONE'
				}
			},
			// user for profile/details lookup off sk
			{
				Put: {
					TableName: process.env.TABLE_NAME,
					Item: {
						pk: {
							S: `user|${userId}`
						},
						sk: {
							S: `email|${email}`
						},
						c,
						u
					}
				}
			},
			// email maps to one user id, for lookup during login
			{
				Put: {
					TableName: process.env.TABLE_NAME,
					Item: {
						pk: {
							S: 'email'
						},
						sk: {
							S: `email|${email}`
						},
						userId: {
							S: userId
						},
						pw: {
							S: hashedPassword
						},
						c,
						u
					},
					ConditionExpression: 'attribute_not_exists(#PK)',
					ExpressionAttributeNames: {
						'#PK': 'pk'
					},
					ReturnValuesOnConditionCheckFailure: 'NONE'
				}
			}
		]
	})

	if (userAlreadyExists(data)) {
		throw new UserAlreadyExists('User already exists for that email address.')
	}

	return {
		id: userId,
		type: 'user',
		meta: {
			created: now,
			updated: now
		},
		attributes: {
			email
		}
	}
}
