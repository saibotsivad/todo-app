import { generatePassword, hashPassword } from '@/shared/worker-passwords/main.node.js'
import { ksuid } from '@/lib/ksuid.js'

// You will need to decide on your expiration policy, but for
// this app a 90 day expiration seems okay?
const SESSION_SECONDS = 7776000 // 90 days = 90 * 24 * 60 * 60

export const createUserSession = async ({ db, config, SDate }, { userId }) => {

	const now = new SDate()
	const nowString = now.toISOString()
	const c = { S: nowString } // created
	const u = { S: nowString } // updated
	const expirationDate = new SDate(now.getTime() + (SESSION_SECONDS * 1000))
	const sessionId = ksuid()
	const sessionSecret = await generatePassword()
	const hashedSecret = await hashPassword({ password: sessionSecret })

	await db('PutItem', {
		TableName: config.get('DYNAMODB_TABLE_NAME'),
		Item: {
			pk: {
				S: `user|${userId}`,
			},
			sk: {
				S: `session|${sessionId}`,
			},
			pw: {
				S: hashedSecret,
			},
			// Note: even though we mark the session with an expiration, we do not
			// want to mark with a TTL to auto-delete, because we want to keep a
			// record of sessions for security audits.
			e: {
				S: expirationDate.toISOString(),
			},
			status: {
				// User sessions are created as active here, but if you
				// build out 2FA you could create them as not-yet-active
				// until the second auth is completed.
				S: 'a', // a = active
			},
			c,
			u,
		},
	})

	return {
		sessionId,
		sessionSecret,
		expirationDate,
	}
}
