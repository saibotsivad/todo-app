import { setupRouter } from './setup-router.js'
import { dynamodb } from '@/service/db.js'
import { routeRequest } from '@/lib/route-request.js'
import { ksuid } from '@/lib/ksuid.js'
import log from '@/service/log.js'
import remapPairsToMap from '@/lib/remap-pairs-to-map.js'
import Trouter from 'trouter'

// set('AWS_ACCOUNT_ID', AWS_ACCOUNT_ID)
// set('AWS_REGION', AWS_REGION)
// set('AWS_ACCESS_KEY_ID', AWS_ACCESS_KEY_ID)
// set('AWS_SECRET_ACCESS_KEY', AWS_SECRET_ACCESS_KEY)
// set('TJ_TABLE_NAME', TJ_TABLE_NAME)
// set('TJ_API_DOMAIN', TJ_API_DOMAIN)
// set('NODE_ENV', 'production')
// set('IS_DEPLOYED', 'true')

// eslint-disable-next-line no-undef
addEventListener('fetch', event => {
	event.respondWith(handleRequest(event.request))
})

let router

async function handleRequest(req) {
	if (!router) {
		// The configuration settings are loaded once per instantiation, so if you
		// change them midway you'll have to wait until the instances go away.
		// eslint-disable-next-line no-undef
		const options = JSON.parse(await TODO_JOURNAL_CONFIGURATION)
		const config = { get: key => options[key] }
		router = new Trouter()
		setupRouter({ db: dynamodb(config), log, config }, router)
	}

	const url = new URL(req.url)
	const request = {
		method: req.method.toUpperCase(),
		headers: remapPairsToMap(req.headers),
		pathname: url.pathname,
		search: url.search,
		body: req.body, // TODO
	}
	if (request.search) {
		request.query = remapPairsToMap(url.searchParams)
	}

	const start = Date.now()
	const requestId = ksuid()
	log.info(`[${requestId}] [START] ${request.method} ${request.pathname}${request.search || ''}`)

	return routeRequest(router, request)
		.then(({
			status,
			headers,
			json,
			body,
		}) => {
			log.info(`[${requestId}] [END] ${request.method} ${request.pathname}${request.search || ''} (${status} after ${Date.now() - start}ms)`)
			if (json || typeof body === 'object') {
				headers = headers || {}
				headers['Content-Type'] = 'application/json'
				body = JSON.stringify(body)
			}
			return new Response(body, {
				status,
				headers: new Headers(headers),
			})
		})
}
