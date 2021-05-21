import { BadRequest } from '@/lib/exceptions.js'
import { passwordIsReasonable } from '@/shared/util/password.js'
import { hashPassword } from '@/shared/worker-passwords/main.node.js'
import { lookupUserById } from '@/lib/controller/user/lookup-by-id.js'

export const resetUserPassword = async ({ db, config, SDate }, { userId, userEmail, password }) => {
	const TableName = config.get('TJ_TABLE_NAME')

	if (!passwordIsReasonable(password)) {
		throw new BadRequest('Passwords must contain at least 8 characters, at least 1 letter, and at least 1 number.')
	}

	if (!userEmail) {
		const user = await lookupUserById({ db, config }, { userId })
		userEmail = user.attributes.email
	}

	const update = {
		ExpressionAttributeNames: {
			'#PASSWORD': 'password',
			'#UPDATED': 'u',
		},
		ExpressionAttributeValues: {
			':password': {
				S: await hashPassword({ password }),
			},
			':updated': {
				S: new SDate().toISOString(),
			},
		},
		UpdateExpression: 'SET #PASSWORD = :password, #UPDATED = :updated',
	}

	await db('TransactWriteItems', {
		TransactItems: [
			// user-by-id collection, for profile, details, session, etc
			{
				Update: {
					TableName,
					Key: {
						pk: {
							S: `user|${userId}`,
						},
						sk: {
							S: 'user',
						},
					},
					...update,
				},
			},
			// email maps to one user id, for lookup during login
			{
				Update: {
					TableName: config.get('TJ_TABLE_NAME'),
					Key: {
						pk: {
							S: `email|${userEmail}`,
						},
						sk: {
							S: 'email',
						},
					},
					...update,
				},
			},
		],
	})
}
