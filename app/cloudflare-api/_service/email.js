import log from '@/service/log.js'

export const sendEmail = async ({ fromAddress, toAddress, subject, body }) => {
	log.debug('sending email', { fromAddress, toAddress, subject, body })
	// TODO use some service like SES
	return true
}
