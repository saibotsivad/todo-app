import { dynamodb } from '../app/cloudflare-api/_service/db.js'
import { lookupUserByEmail } from '../app/cloudflare-api/_lib/controller/user/lookup-by-email.js'
import { removeUser } from '../app/cloudflare-api/_lib/controller/user/remove-user.js'
import { listSessionsByUserId } from '../app/cloudflare-api/_lib/controller/session/list-sessions-by-user-id.js'
import { removeUserSession } from '../app/cloudflare-api/_lib/controller/session/remove-user-session.js'

const config = { get: key => process.env[key] }
const db = dynamodb(config)
const services = { config, db }
const email = `testuser+${process.env.STAGE || 'local'}@${process.env.TJ_API_DOMAIN || 'localhost'}`

const run = async () => {
	const user = await lookupUserByEmail(services, { email })
	if (!user) {
		console.log('No user found, skipping the rest of user removal steps.')
	} else {
		console.log(`Found user: ${user.id}`)

		const sessions = await listSessionsByUserId(services, { userId: user.id })
		console.log(`Removing ${sessions.length} sessions.`)
		for (const session of sessions) {
			console.log('Removing session:', session.id)
			await removeUserSession(services, {
				userId: user.id,
				sessionId: session.id,
			})
		}

		await removeUser(services, { userId: user.id })
	}
}

run()
	.then(() => {
		console.log('Success cleaning up previous integration test data.', email)
		process.exit(0)
	})
	.catch(error => {
		console.error('Error thrown while trying to cleanup previous integration test data.', error)
		process.exit(1)
	})
