import { UnexpectedServiceResponse } from '@/lib/exceptions.js'
import { getEmailTemplate } from '@/lib/controller/email-template/get-email-template.js'
import { ksuid } from '@/lib/ksuid.js'

const Charset = 'UTF-8'

let remark
let renderView

export const sendEmailTemplate = async (services, { fromAddress, toAddress, subject, templateId, parameters }) => {
	const { config, db, email, log, SDate } = services

	const emailTemplate = await getEmailTemplate(services, { id: templateId })
	if (!emailTemplate) {
		throw new Error(`Could not locate template by id "${templateId}", this is a developer error.`)
	}

	const now = new SDate().toISOString()
	const c = { S: now } // created
	const emailId = ksuid()

	if (!remark || !renderView) {
		const imported = await Promise.all([
			import('remarkable'),
			import('templite'),
		])
		renderView = imported.default.templite
		remark = new imported.Remarkable({
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
			// and smart quotes on. E.g., set doubles to '«»' for Russian, '„“' for German.
			quotes: '“”‘’',
		})
	}

	const markdown = renderView(emailTemplate.attributes.view, {
		...parameters,
		emailId,
	})
	const html = remark.render(markdown)

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

	await db('PutItem', {
		TableName: config.get('DYNAMODB_TABLE_NAME'),
		Item: {
			pk: {
				S: 'sentEmail',
			},
			sk: {
				S: `sentEmail|${emailId}`,
			},
			toAddress: {
				S: toAddress,
			},
			fromAddress: {
				S: fromAddress,
			},
			html: {
				S: html,
			},
			markdown: {
				S: markdown,
			},
			templateId: {
				S: templateId,
			},
			parameters: {
				M: Object
					.keys(parameters)
					.reduce((map, key) => {
						map[key] = { S: JSON.stringify(parameters[key]) }
						return map
					}, {}),
			},
			c,
		},
	})

	return {
		id: emailId,
		type: 'sentEmail',
		attributes: {
			fromAddress,
			toAddress,
			html,
			markdown,
			parameters,
			templateId,
		},
		meta: {
			created: now,
		},
	}
}
