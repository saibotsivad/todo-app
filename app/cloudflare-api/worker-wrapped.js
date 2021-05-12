import polka from '@/lib/polka/polka.js'
import { setupServer } from './setup-server.js'
import { db } from '@/service/db.js'
import log from '@/service/log.js'

// set('AWS_ACCOUNT_ID', AWS_ACCOUNT_ID)
// set('AWS_REGION', AWS_REGION)
// set('AWS_ACCESS_KEY_ID', AWS_ACCESS_KEY_ID)
// set('AWS_SECRET_ACCESS_KEY', AWS_SECRET_ACCESS_KEY)
// set('TJ_TABLE_NAME', TJ_TABLE_NAME)
// set('TJ_API_DOMAIN', TJ_API_DOMAIN)
// set('NODE_ENV', 'production')
// set('IS_DEPLOYED', 'true')

addEventListener('fetch', event => {
	event.respondWith(handleRequest(event.request))
})

const config = {
	get: async key => CONFIGURATION.get(key)
}

let api

async function handleRequest(request) {
	if (!api) {
		api = polka()
		setupServer({ db, config, log }, api)
	}
	const { body, headers } = await api(request)
	return new Response(body, { headers })
}
