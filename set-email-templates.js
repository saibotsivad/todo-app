import { dynamodb } from './app/cloudflare-api/_service/db.js'
import { catchify } from './_shared/catchify.js'
import { getEmailTemplate } from './app/cloudflare-api/_lib/controller/email-template/get-email-template.js'
import { putEmailTemplate } from './app/cloudflare-api/_lib/controller/email-template/put-email-template.js'
import { parse } from '@saibotsivad/blockdown'
import { join } from 'path'
import fs from 'fs/promises'
import yaml from 'js-yaml'

import * as templates from './app/cloudflare-api/_lib/controller/email-template/static/_template-ids.js'
const TEMPLATE_FOLDER = './app/cloudflare-api/_lib/controller/email-template/static'

const services = {
	config: { get: key => process.env[key] },
	db: dynamodb({ get: key => process.env[key] }),
	SDate: Date,
}

const setEmailTemplates = async () => {
	for (const file of Object.values(templates)) {
		const filepath = join(TEMPLATE_FOLDER, file)
		const fileString = await fs.readFile(filepath, 'utf8')

		const { blocks, warnings } = parse(fileString)

		if (warnings.length) {
			for (const { index, code, line } of warnings) {
				console.log(`${code} at line ${index}: ${line}`)
			}
			process.exit(1)
		}

		if (blocks.length !== 2 || (blocks[0] && blocks[0].name || '') !== 'frontmatter' || (blocks[1] && blocks[1].name || '') !== 'markdown') {
			console.log('The first section must be frontmatter and the second markdown.', file)
			process.exit(1)
		}

		const [{ content: frontmatter }, { content: markdown }] = blocks
		const { parameters } = yaml.load(frontmatter)

		const [ , existing ] = await catchify(getEmailTemplate(services, { id: file }))

		if (!existing || JSON.stringify(existing.attributes.parameters) !== JSON.stringify(parameters)) {
			console.log('Updating email template parameters:', file)
			await putEmailTemplate(services, {
				id: file,
				attributes: {
					parameters,
					view: existing
						? existing.attributes.view
						: markdown,
				},
			})
		} else {
			console.log('No changes detected for email template:', file)
		}

	}
}

const start = Date.now()
setEmailTemplates()
	.then(() => {
		console.log(`Completed successfully after ${Date.now() - start}ms`)
		process.exit(0)
	})
	.catch(error => {
		console.log(`Initialization failed after ${Date.now() - start}ms:`, error)
		process.exit(1)
	})
