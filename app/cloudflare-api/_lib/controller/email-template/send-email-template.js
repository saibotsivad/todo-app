import { UnexpectedServiceResponse } from '@/lib/exceptions.js'
import { getEmailTemplate } from '@/lib/controller/email-template/get-email-template.js'
import snarkdown from 'snarkdown'
import templite from 'templite'

const Charset = 'UTF-8'

export const sendEmailTemplate = async (services, { fromAddress, toAddress, subject, templateId, parameters }) => {
	const { email, log } = services

	const emailTemplate = await getEmailTemplate(services, { id: templateId })
	if (!emailTemplate) {
		throw new Error(`Could not locate template by id "${templateId}", this is a developer error.`)
	}

	const markdown = templite(emailTemplate.attributes.view, parameters)
	const html = snarkdown(markdown)

	const { success, data, response, statusCode } = await email('SendEmail', {
		Destination: { ToAddresses: [ toAddress ] },
		ReplyToAddresses: [ fromAddress ],
		Source: fromAddress,
		Message: {
			Subject: { Charset, Data: subject },
			Body: {
				Text: { Charset, Data: markdown },
				Html: { Charset, Data: html },
			},
		},
	})

	log.info('sent email template', { success, data, fromAddress, toAddress, templateId })

	if (!success) {
		throw new UnexpectedServiceResponse('Error while sending email through SES.', { statusCode, statusCodeType: typeof statusCode, data, fromAddress, toAddress, templateId, response })
	}
}
