import 'source-map-support/register.js'
import { setupRouter } from './setup-router.js'
import { generateIndex } from '../cloudflare-static/generate-index.js'
import { db } from '@/service/db.js'
import { routeRequest } from '@/lib/route-request.js'
import { ksuid } from '@/lib/ksuid.js'
import { serveFile } from '@/lib/serve-file.js'
import { join } from 'path'
import log from '@/service/log.js'
import Trouter from 'trouter'
import http from 'http'
import remapPairsToMap from '@/lib/remap-pairs-to-map.js'

const requiredEnvironmentVariables = [
	'AWS_ACCOUNT_ID',
	'AWS_REGION',
	'AWS_ACCESS_KEY_ID',
	'AWS_SECRET_ACCESS_KEY',
	'TJ_TABLE_NAME',
	'TJ_API_DOMAIN'
]

const port = parseInt(process.env.PORT || '3000', 10)

if (!requiredEnvironmentVariables.every(key => process.env[key])) {
	console.log('Some environment variables are not set.')
	console.log('Required: ' + requiredEnvironmentVariables.join(', '))
	console.log('Not set: ' + requiredEnvironmentVariables.filter(key => !process.env[key]).join(', '))
	process.exit(1)
}

const configValues = requiredEnvironmentVariables
	.concat([
		'NODE_ENV'
	])
	.reduce((map, key) => {
		map[key] = process.env[key]
		return map
	}, {})

const config = {
	get: async key => configValues[key]
}

const router = new Trouter()

router.add('GET', '/', async () => ({
	headers: {
		'Content-Type': 'text/html'
	},
	body: generateIndex(`http://localhost:${port}/__build__/`),
	status: 200
}))

const serveDocs = async request => serveFile({
	filepath: join('deploy/cloudflare-static/public/docs', request.params.path || '/')
})
router.add('GET', '/docs/', serveDocs)
router.add('GET', /docs\/(?<path>.+)$/, serveDocs)

router.add('GET', /__build__\/(?<path>.+)$/, async request => serveFile({
	filepath: join('deploy/cloudflare-static/public', request.params.path)
}))

setupRouter({ db, config, log }, router)

const server = http.createServer((req, res) => {
	// trusting the `host` of the header is not good in production, but for
	// local development it should be fine enough
	const url = new URL(`http://${req.headers.host}${req.url}`)
	const request = {
		method: req.method.toUpperCase(),
		pathname: url.pathname,
		search: url.search,
		headers: Object.keys(req.headers).reduce((map, key) => {
			map[key] = req.headers[key]
			return map
		}, {}),
		body: req.body // TODO
	}

	if (request.search) {
		request.query = remapPairsToMap(url.searchParams)
	}

	const start = Date.now()
	const requestId = ksuid()
	log.info(`[${requestId}] [START] ${request.method} ${request.pathname}${request.search || ''}`)

	routeRequest(router, request)
		.then(({
			status,
			headers,
			json,
			body
		}) => {
			log.info(`[${requestId}] [END] ${request.method} ${request.pathname}${request.search || ''} (${status} after ${Date.now() - start}ms)`)
			if (json || typeof body === 'object') {
				headers = headers || {}
				headers['Content-Type'] = 'application/json'
			}
			if (headers) {
				Object.keys(headers).forEach(key => {
					res.setHeader(key, headers[key])
				})
			}
			res.writeHead(status)
			if (json || typeof body === 'object') {
				res.end(JSON.stringify(body))
			} else {
				res.end(body)
			}
		})
})

console.log(`> Running on localhost:${port}`)

server.listen(port)
