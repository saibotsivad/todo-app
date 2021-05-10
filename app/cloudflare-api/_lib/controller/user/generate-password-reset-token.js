export default async ({ db, config, log }, { user }) => {
	log.debug('generating password reset token for user', { db, config, user })
	// TODO insert password reset token into DynamoDB
	// as new document, with a TTL so it'll get automatically
	// cleaned up later
}
