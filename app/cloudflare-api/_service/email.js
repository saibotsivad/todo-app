export const sendEmail = async ({ log }, { fromAddress, toAddress, subject, body }) => {
	log.debug('sending email', { fromAddress, toAddress, subject, body })
	// TODO use some service like SES
	return true
}
