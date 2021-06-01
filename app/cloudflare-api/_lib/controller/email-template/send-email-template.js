import { UnexpectedServiceResponse } from '@/lib/exceptions.js'
import { getEmailTemplate } from '@/lib/controller/email-template/get-email-template.js'
import { Remarkable } from 'remarkable'
import templite from 'templite'

const Charset = 'UTF-8'

let md

export const sendEmailTemplate = async (services, { fromAddress, toAddress, subject, templateId, parameters }) => {
	const { email, log } = services

	const emailTemplate = await getEmailTemplate(services, { id: templateId })
	if (!emailTemplate) {
		throw new Error(`Could not locate template by id "${templateId}", this is a developer error.`)
	}

	if (!md) {
		md = new Remarkable({
			// Set to true to enable HTML tags in the source markdown
			html: true,
			// Set to true to use '/' to close single tags (<br />)
			xhtmlOut: false,
			// Set to true to convert '\n' in paragraphs into <br>
			breaks: false,
			// CSS language prefix for fenced blocks
			langPrefix: 'language-',
			// Enable some language-neutral replacement + quotes beautification
			typographer: true,
			// Double + single quotes replacement pairs, when typographer enabled,
			// and smartquotes on. Set doubles to '«»' for Russian, '„“' for German.
			quotes: '“”‘’',
		})
	}

	const markdown = templite(emailTemplate.attributes.view, parameters)
	const html = md.render(markdown)

	const { success, data, response } = await email('SendEmail', {
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
		throw new UnexpectedServiceResponse('Error while sending email through SES.', { data, fromAddress, toAddress, templateId, response })
	}
}
