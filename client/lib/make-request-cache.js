/*
A simple GET request cache that only caches on router page loads and changes. That way you can
call the same API endpoint in multiple resolves but it will only be called the one time.

For each endpoint request, you will need to create a new cache:

```js
import { makeRequestCache } from 'lib/make-request-cache.js'
import { router } from 'lib/state-router.js'

export const exampleRequest = async () => makeRequestCache(
	router,
	() => get('/api/v1/example')
)
```

 */
export const makeRequestCache = (router, makeRequest) => {
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
