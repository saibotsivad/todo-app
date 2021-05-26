import { BadRequest, ItemAlreadyExists } from '@/lib/exceptions.js'
import { normalizeEmail } from '@/lib/email.js'
import { hashPassword } from '@/shared/worker-passwords/main.node.js'
import { itemAlreadyExists } from '@/lib/dynamodb-helpers.js'
import { ksuid } from '@/lib/ksuid.js'
import { passwordIsReasonable } from '@/shared/util/password.js'

export const createUser = async ({ db, config, SDate }, { email, password }) => {
	if (!passwordIsReasonable(password)) {
		throw new BadRequest('Passwords must contain at least 8 characters, at least 1 letter, and at least 1 number.')
	}

	const now = new SDate().toISOString()
	const c = { S: now } // created
	const u = { S: now } // updated
	const userId = ksuid()
	const hashedPassword = await hashPassword({ password })
	email = normalizeEmail(email)

	const { data } = await db('TransactWriteItems', {
		TransactItems: [
			// user in user collection, for looking at list of all users
			{
				Put: {
					TableName: config.get('TJ_TABLE_NAME'),
					Item: {
						pk: {
							S: 'user',
						},
						sk: {
							S: `user|${userId}`,
						},
						// we save the email here so we can view it when listing all users
						email: {
							S: email,
						},
						c,
						u,
					},
					ConditionExpression: 'attribute_not_exists(#PK)',
					ExpressionAttributeNames: {
						'#PK': 'pk',
					},
					ReturnValuesOnConditionCheckFailure: 'NONE',
				},
			},
			// user-by-id collection, for profile, details, session, etc
			{
				Put: {
					TableName: config.get('TJ_TABLE_NAME'),
					Item: {
						pk: {
							S: `user|${userId}`,
						},
						sk: {
							S: 'user',
						},
						password: {
							S: hashedPassword,
						},
						// the "email" here is saved so we can do the reverse lookup for the
						// document used by the login
						email: {
							S: email,
						},
						c,
						u,
					},
				},
			},
			// email maps to one user id, for lookup during login
			{
				Put: {
					TableName: config.get('TJ_TABLE_NAME'),
					Item: {
						pk: {
							S: `email|${email}`,
						},
						sk: {
							S: 'email',
						},
						userId: {
							S: userId,
						},
						password: {
							S: hashedPassword,
						},
						c,
						u,
					},
					ConditionExpression: 'attribute_not_exists(#PK)',
					ExpressionAttributeNames: {
						'#PK': 'pk',
					},
					ReturnValuesOnConditionCheckFailure: 'NONE',
				},
			},
		],
	})

	if (itemAlreadyExists(data)) {
		throw new ItemAlreadyExists('User already exists for that email address.')
	}

	return {
		id: userId,
		type: 'user',
		meta: {
			created: now,
			updated: now,
		},
		attributes: {
			email,
			password: hashedPassword,
		},
	}
}
