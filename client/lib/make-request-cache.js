import { router } from 'lib/state-router.js'

// A simple GET request cache that only chaches on router page loads and changes. That way you can
// call the same API endpoint in multiple resolves but it will only be called the one time.
//
// For each request
export const makeRequestCache = (makeRequest) => {
	let responsePromise

	const clear = () => {
		responsePromise = null
	}

	router.on('stateChangeCancelled', clear)
	router.on('stateChangeEnd', clear)
	router.on('stateChangeError', clear)
	router.on('stateError', clear)
	router.on('routeNotFound', clear)

	return async () => {
		if (!responsePromise) {
			responsePromise = makeRequest()
		}
		return responsePromise
	}
}
