import { ItemAlreadyExists } from '@/lib/exceptions.js'
import { generatePassword, hashPassword } from '@/shared/worker-passwords/main.node.js'
import { itemAlreadyExists } from '@/lib/dynamodb-helpers.js'
import { ksuid } from '@/lib/ksuid.js'

// You will need to decide on your expiration policy, but for
// this app a 90 day expiration seems okay?
const SESSION_SECONDS = 7776000 // 90 days = 90 * 24 * 60 * 60

export default async ({ db, config }, { user }) => {

	const now = new Date()
	const c = { S: now.toISOString() } // created
	const u = { S: now.toISOString() } // updated
	const expirationDate = new Date(now.getTime() + (SESSION_SECONDS * 1000))
	const sessionId = ksuid()
	const sessionSecret = await generatePassword()
	const hashedSecret = await hashPassword({ password: sessionSecret })

	const { data } = await db('PutItem', {
		TableName: config.get('TJ_TABLE_NAME'),
		Item: {
			pk: {
				S: `user|${user.id}`,
			},
			sk: {
				S: `session|${sessionId}`,
			},
			pw: {
				S: hashedSecret,
			},
			e: {
				S: expirationDate.toISOString(),
			},
			status: {
				// User sessions are created as active here, but if you
				// build out 2FA you could create them as not-yet-active.
				S: 'a', // a = active
			},
			c,
			u,
		},
		ConditionExpression: 'attribute_not_exists(#SK)',
		ExpressionAttributeNames: {
			'#SK': 'sk',
		},
		ReturnValuesOnConditionCheckFailure: 'NONE',
	})

	if (itemAlreadyExists(data)) {
		throw new ItemAlreadyExists('Session for user already exists.')
	}

	return {
		sessionId,
		sessionSecret,
		expirationDate,
	}
}
