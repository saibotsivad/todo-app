import { getAssetFromKV } from '@cloudflare/kv-asset-handler'
import { generateIndex } from './generate-index.js'

addEventListener('fetch', event => {
	event.respondWith(handleEvent(event))
})

async function handleEvent(event) {
	let pathname = new URL(event.request.url).pathname

	if (pathname === '/') {
		return new Response(generateIndex('/test/'), {
			status: 200,
			headers: new Headers({
				'Content-Type': 'text/html'
			})
		})
	}

	try {
		return await getAssetFromKV(event)
	} catch (e) {
		return new Response(`"${pathname}" not found`, { status: 404, statusText: "not found" })
	}
}
