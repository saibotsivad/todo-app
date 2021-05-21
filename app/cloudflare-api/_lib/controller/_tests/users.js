import { createUser } from '@/lib/controller/user/create-user.js'
import { listAllUsers } from '@/lib/controller/user/list-all-users.js'
import { lookupUserById } from '@/lib/controller/user/lookup-by-id.js'
import { lookupUserByEmail } from '@/lib/controller/user/lookup-by-email.js'
import { createUserPasswordResetToken } from '@/lib/controller/user-password/create-password-reset-token.js'
import { verifyPasswordResetToken } from '@/lib/controller/user-password/verify-password-reset-token.js'
import { resetUserPassword } from '@/lib/controller/user-password/reset-password.js'
import { removeUser } from '@/lib/controller/user/remove-user.js'
import { createUserSession } from '@/lib/controller/session/create-user-session.js'
import { expireUserSession } from '@/lib/controller/session/expire-user-session.js'
import { listSessionsByUserId } from '@/lib/controller/session/list-sessions-by-user-id.js'
import { getUserSession } from '@/lib/controller/session/get-user-session.js'
import { removeUserSession } from '@/lib/controller/session/remove-user-session.js'
import { catchify } from '@/shared/catchify.js'

import { listAllData, run, services } from './test-helpers.js'

const email = 'test@site.com'
let password = 'its_over_9000!!!!!!'

run(false, async ({ vlog, assert }) => {
	await listAllData(true, true)

	const user = await createUser(services, { email, password })
	const userId = user.id
	vlog('USER', user)
	const [ error ] = await catchify(createUser(services, { email, password }))
	assert('create user should fail since already created', error.status === 409)

	const { data: users } = await listAllUsers(services)
	vlog('USERS', users)

	vlog('USER_BY_ID', await lookupUserById(services, { userId }))
	vlog('USER_BY_EMAIL', await lookupUserByEmail(services, { email }))

	const { tokenId, tokenSecret } = await createUserPasswordResetToken(services, { userId })
	vlog('PW_RESET', { tokenId, tokenSecret })

	assert('bad token id is not valid', !(await verifyPasswordResetToken(services, { userId, tokenId: 'foo', tokenSecret: 'bar' })))
	assert('bad token secret is not valid', !(await verifyPasswordResetToken(services, { userId, tokenId, tokenSecret: 'bar' })))
	assert('good token secret is valid', !!(await verifyPasswordResetToken(services, { userId, tokenId, tokenSecret })))

	assert('the id password is unchanged', (await lookupUserById(services, { userId })).attributes.password === user.attributes.password)
	assert('the email password is unchanged', (await lookupUserByEmail(services, { email })).attributes.password === user.attributes.password)
	password = password + ' theres no way thats right'
	await resetUserPassword(services, { userId, password })
	assert('the id password was updated', (await lookupUserById(services, { userId })).attributes.password !== user.attributes.password)
	assert('the email password was updated', (await lookupUserByEmail(services, { email })).attributes.password !== user.attributes.password)

	const { sessionId, sessionSecret } = await createUserSession(services, { userId })
	vlog('SESSION', { sessionId, sessionSecret })
	vlog('SESSION_GET', await getUserSession(services, { userId, sessionId }))
	vlog('USER_SESSIONS', (await listSessionsByUserId(services, { userId })).data)

	await expireUserSession(services, { userId, sessionId })
	const expiredSession = await getUserSession(services, { userId, sessionId })
	assert('no password is set', !expiredSession.attributes.password)
	assert('session is inactive', expiredSession.attributes.status === 'i')

	await removeUserSession(services, { userId, sessionId })
	assert('session does not exist', !(await getUserSession(services, { userId, sessionId })))
	assert('not in the list either', !(await listSessionsByUserId(services, { userId })).data.length)

	await removeUser(services, { userId })

	await listAllData(false, true)
})
