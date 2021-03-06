import { BadRequest } from '@/lib/exceptions.js'
import { setupRouter } from './setup-router.js'
import { dynamodb } from '@/service/db.js'
import { routeRequest } from '@/lib/route-request.js'
import { ses } from '@/service/email.js'
import { ksuid } from '@/lib/ksuid.js'
import errorFormatter from '@/lib/error-formatter.js'
import log from '@/service/log.js'
import remapPairsToMap from '@/lib/remap-pairs-to-map.js'
import Trouter from 'trouter'
import { checkEnvironmentVariables } from '@/lib/environment-variables.js'

// eslint-disable-next-line no-undef
addEventListener('fetch', event => {
	event.respondWith(handleRequest(event.request))
})

const supportedWriteMethods = [
	'POST',
	'PATCH',
]

let router

const errorHandler = (status, error) => new Response(JSON.stringify({
	errors: [ errorFormatter(error) ],
}), {
	status,
	headers: new Headers({
		'content-type': 'application/json',
	}),
})

async function handleRequest(req) {
	if (!router) {
		// The configuration settings are loaded once per instantiation, so if you
		// change them midway you'll have to wait until the instances go away.
		/* global API_CONFIGURATION */
		const options = JSON.parse(await API_CONFIGURATION)
		const notSet = checkEnvironmentVariables(options)
		if (notSet) {
			return new Response(notSet, {
				status: 500,
			})
		}
		const config = { get: key => options[key] }
		router = new Trouter()
		setupRouter({ db: dynamodb(config), email: ses(config), log, config, SDate: Date }, router)
	}

	const url = new URL(req.url)
	const request = {
		method: req.method.toUpperCase(),
		headers: remapPairsToMap(req.headers),
		pathname: url.pathname,
		search: url.search,
	}
	if (request.search) {
		request.query = remapPairsToMap(url.searchParams)
	}

	if (supportedWriteMethods.includes(request.method)) {
		if ((req.headers.get('content-type') || '').includes('application/json')) {
			try {
				request.body = await req.json()
			} catch (error) {
				return errorHandler(400, new BadRequest('Could not parse JSON body of request. Badly formatted JSON string?'))
			}
		} else {
			return errorHandler(400, new BadRequest('Write requests currently only accept JSON, and must have the Content-Type header set.'))
		}
	}

	const start = Date.now()
	request.id = ksuid()
	log.info(`[${request.id}] [START] ${request.method} ${request.pathname}${request.search || ''}`)

	return routeRequest(router, request)
		.then(({
			status,
			headers,
			json,
			body,
		}) => {
			const requestMillis = Date.now() - start
			log.info(`[${request.id}] [END] [COMPLETED] ${request.method} ${request.pathname}${request.search || ''} (${status} after ${requestMillis}ms)`)
			headers = headers || {}
			headers['api-request-id'] = request.id
			headers['api-request-ms'] = requestMillis
			if (json || typeof body === 'object') {
				headers['Content-Type'] = 'application/json'
				body = JSON.stringify(body)
			}
			return new Response(body, {
				status,
				headers: new Headers(headers),
			})
		})
		.catch(error => {
			log.error(`[${request.id}] [END] [FAILED] ${request.method} ${request.pathname}${request.search || ''} (${status} after ${Date.now() - start}ms)`)
			return errorHandler(500, error)
		})
}
