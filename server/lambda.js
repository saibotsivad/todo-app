import { setupServer } from './setup-server.js'





const lambdaRequest = ({ event }) => {
	return {
		method: event.httpMethod,
		path: event.path,
		headers: Object.keys(event.headers).reduce((map, key) => {
			map[key.toLowerCase()] = event.headers[key]
			return map
		}, {}),
		query: event.multiValueQueryStringParameters
	}
}

export default async ({ event, context }) => {
	return {
		statusCode: 200,
		body: JSON.stringify({
			now: new Date().getTime(),
			event,
			context,
			request: lambdaRequest({ event })
		})
	}
}
