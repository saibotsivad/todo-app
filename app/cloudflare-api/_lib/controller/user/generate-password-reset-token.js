import log from '@/service/log.js'

export default async ({ user }) => {
	log.debug('generating password reset token for user', { user })
	// TODO insert password reset token into DynamoDB
	// as new document, with a TTL so it'll get automatically
	// cleaned up later
}
