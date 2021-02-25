import { BadRequest, ItemAlreadyExists } from 'lib/exceptions.js'
import { db } from 'service/dynamodb.js'
import { generatePassword } from 'lib/password.js'
import { normalizeEmail } from 'lib/email.js'
import { hashPassword } from 'lib/password.js'
import { itemAlreadyExists } from 'lib/dynamodb-helpers.js'
import KSUID from 'ksuid'

// You will need to decide on your expiration policy, but for
// this app a 90 day expiration seems okay?
const SESSION_SECONDS = 7776000 // 90 days = 90 * 24 * 60 * 60

export default async ({ user }) => {

	const now = new Date()
	const c = { S: now.toISOString() } // created
	const u = { S: now.toISOString() } // updated
	const expirationDate = new Date(now.getTime() + (SESSION_SECONDS * 1000))
	const [ sessionId, sessionSecret ] = await Promise.all([
		KSUID.random().then(s => s.string),
		generatePassword()
	])
	const hashedSecret = await hashPassword({ password: sessionSecret })

	const { data, status } = await db('PutItem', {
		TableName: process.env.TABLE_NAME,
		Item: {
			pk: {
				S: `user|${user.id}`
			},
			sk: {
				S: `session|${sessionId}`
			},
			pw: {
				S: hashedSecret
			},
			e: {
				S: expirationDate.toISOString()
			},
			c,
			u
		},
		ConditionExpression: 'attribute_not_exists(#SK)',
		ExpressionAttributeNames: {
			'#SK': 'sk'
		},
		ReturnValuesOnConditionCheckFailure: 'NONE'
	})

	if (itemAlreadyExists(data)) {
		throw new ItemAlreadyExists('Session for user already exists.')
	}

	return {
		sessionId,
		sessionSecret,
		expirationDate
	}
}
