import { lookupUserById } from '@/lib/controller/user/lookup-by-id.js'

export const removeUser = async ({ db, config }, { userId, email }) => {
	const TableName = config.get('DYNAMODB_TABLE_NAME')

	if (!email) {
		const user = await lookupUserById({ db, config }, { userId })
		email = user.attributes.email
	}

	await db('TransactWriteItems', {
		TransactItems: [
			// user in user collection, for looking at list of all users
			{
				Delete: {
					TableName,
					Key: {
						pk: {
							S: 'user',
						},
						sk: {
							S: `user|${userId}`,
						},
					},
				},
			},
			// user-by-id collection, for profile, details, session, etc
			{
				Delete: {
					TableName,
					Key: {
						pk: {
							S: `user|${userId}`,
						},
						sk: {
							S: 'user',
						},
					},
				},
			},
			// email maps to one user id, for lookup during login
			{
				Delete: {
					TableName,
					Key: {
						pk: {
							S: `email|${email}`,
						},
						sk: {
							S: 'email',
						},
					},
				},
			},
		],
	})
}
