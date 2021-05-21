import { generatePassword, hashPassword } from '@/shared/worker-passwords/main.node.js'
import { ksuid } from '@/lib/ksuid.js'

// You will need to decide on your password-reset expiration policy, but in general
// a password reset token should last at least a few hours.
const EXPIRATION_SECONDS = 43200 // 24 hours = 12 * 60 * 60

export const createUserPasswordResetToken = async ({ db, config, SDate }, { userId }) => {

	const now = new SDate()
	const c = { S: now.toISOString() } // created
	const u = { S: now.toISOString() } // updated
	const expirationDate = new SDate(now.getTime() + (EXPIRATION_SECONDS * 1000))
	const tokenId = ksuid()
	const tokenSecret = await generatePassword()
	const hashedSecret = await hashPassword({ password: tokenSecret })

	await db('PutItem', {
		TableName: config.get('TJ_TABLE_NAME'),
		Item: {
			pk: {
				S: `user|${userId}`,
			},
			sk: {
				S: `pwreset|${tokenId}`,
			},
			pw: {
				S: hashedSecret,
			},
			e: {
				S: expirationDate.toISOString(),
			},
			// DynamoDB TTL is configured on this table, so that means "eventually"
			// after the expiration date the document will be deleted.
			ttl: {
				N: expirationDate.getTime(),
			},
			c,
			u,
		},
	})

	return {
		tokenId,
		tokenSecret,
		expirationDate,
	}
}
