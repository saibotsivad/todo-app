import { readSelfUser } from '@/lib/roles.js'

export const setUserRoles = async ({ db, config, SDate }, { userId, updatedRoles }) => {

	const TableName = config.get('DYNAMODB_TABLE_NAME')
	const updated = { S: new SDate().toISOString() }
	const roles = { SS: updatedRoles || [] }
	if (!roles.SS.includes(readSelfUser.urn)) {
		roles.SS.push(readSelfUser.urn)
	}

	await db('TransactWriteItems', {
		TransactItems: [
			// user in user collection, for looking at list of all users
			{
				Update: {
					TableName,
					Key: {
						pk: {
							S: 'user',
						},
						sk: {
							S: `user|${userId}`,
						},
					},
					ExpressionAttributeNames: {
						'#UP': 'u',
						'#RO': 'roles',
					},
					ExpressionAttributeValues: {
						':up': updated,
						':ro': roles,
					},
					ReturnValues: 'NONE',
					UpdateExpression: 'SET #UP = :up, #RO = :ro',
				},
			},
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
					ExpressionAttributeNames: {
						'#UP': 'u',
						'#RO': 'roles',
					},
					ExpressionAttributeValues: {
						':up': updated,
						':ro': roles,
					},
					ReturnValues: 'NONE',
					UpdateExpression: 'SET #UP = :up, #RO = :ro',
				},
			},
		],
	})
}
