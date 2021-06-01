import 'source-map-support/register.js'
import { setupRouter } from './setup-router.js'
import { generateIndex } from '../cloudflare-static/generate-index.js'
import { dynamodb } from '@/service/db.js'
import { ses } from '@/service/email.js'
import { routeRequest } from '@/lib/route-request.js'
import { ksuid } from '@/lib/ksuid.js'
import { serveFile } from '@/lib/serve-file.js'
import { join } from 'path'
import fs from 'fs/promises'
import log from '@/service/log.js'
import Trouter from 'trouter'
import http from 'http'
import remapPairsToMap from '@/lib/remap-pairs-to-map.js'
import { checkEnvironmentVariables } from '@/lib/environment-variables.js'

const port = parseInt(process.env.PORT || '3000', 10)

const notSet = checkEnvironmentVariables(process.env)
if (notSet) {
	console.log(notSet)
	process.exit(1)
}

const config = {
	get: key => process.env[key],
}

if (process.env.LOCAL_SES_FOLDER) {
	config.ses = async (action, parameters) => {
		if (action !== 'SendEmail') {
			throw new Error('local running currently only supports SendEmail')
		}
		const requestId = ksuid()
		await fs.mkdir(process.env.LOCAL_SES_FOLDER, { recursive: true })
		await fs.writeFile(join(process.env.LOCAL_SES_FOLDER, `./ses-send-email-${requestId}.json`), JSON.stringify(parameters, undefined, 2), 'utf-8')
		return { success: true, data: { requestId: `localhost:${requestId}` } }
	}
}

const router = new Trouter()

router.add('GET', '/', async () => ({
	headers: {
		'Content-Type': 'text/html',
	},
	body: generateIndex(`http://localhost:${port}/__build__/`),
	status: 200,
}))

const serveDocs = async request => serveFile({
	filepath: join('deploy/cloudflare-static/public/docs', request.params.path || '/'),
})
router.add('GET', '/docs/', serveDocs)
router.add('GET', /docs\/(?<path>.+)$/, serveDocs)

router.add('GET', /__build__\/(?<path>.+)$/, async request => serveFile({
	filepath: join('deploy/cloudflare-static/public', request.params.path),
}))

setupRouter({ db: dynamodb(config), email: ses(config), config, log, SDate: Date }, router)

const getBody = req => new Promise(resolve => {
	let data = ''
	req.on('data', chunk => {
		data += chunk
	})
	req.on('end', () => {
		let output
		try {
			output = data && (req.headers['content-type'] || '').toLowerCase().includes('application/json')
				? JSON.parse(data)
				: data
			resolve(output)
		} catch (error) {
			console.error('could not parse data as json', output)
			resolve(data)
		}
	})
})

const handleHttpRequest = async (requestId, req, res) => {
	// trusting the `host` of the header is not good in production, but for
	// local development it should be fine enough
	const url = new URL(`https://${req.headers.host}${req.url}`)
	const request = {
		id: requestId,
		method: req.method.toUpperCase(),
		pathname: url.pathname,
		search: url.search,
		headers: Object.keys(req.headers).reduce((map, key) => {
			map[key] = req.headers[key]
			return map
		}, {}),
		body: await getBody(req),
	}

	if (request.search) {
		request.query = remapPairsToMap(url.searchParams)
	}

	let { status, headers, json, body } = await routeRequest(router, request)
	headers = headers || {}
	headers['api-request-id'] = request.id
	if (json || typeof body === 'object') {
		headers['Content-Type'] = 'application/json'
	}
	if (headers) {
		Object.keys(headers).forEach(key => {
			res.setHeader(key, headers[key])
		})
	}
	res.writeHead(status || 500)
	if (json || typeof body === 'object') {
		res.end(JSON.stringify(body))
	} else {
		res.end(body)
	}
	return { request, status }
}

const server = http.createServer((req, res) => {
	const start = Date.now()
	const requestId = ksuid()
	log.info(`[${requestId}] [START] ${req.method.toUpperCase()} ${req.url}`)
	handleHttpRequest(requestId, req, res)
		.then(({ request, status }) => {
			log.info(`[${requestId}] [END] ${request.method} ${request.pathname}${request.search || ''} (${status} after ${Date.now() - start}ms)`)
		})
})

console.log(`> Running on localhost:${port}`)

server.listen(port)
