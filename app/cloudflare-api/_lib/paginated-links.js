/**
 * Generate a JSON:API `links` object, for endpoints returning paginated data.
 * @param {String} path - The path of the endpoint.
 * @param {String} offsetKey - The offset key given back by DynamoDB.
 * @param {String|Number} limit - The limit as specified in the request.
 * @param {Object} config - The service object configuration getter.
 * @returns {{next: (string|null), last: null, prev: null, first: string}} - The JSON:API formatted `links` object.
 */
export const paginatedLinks = (path, offsetKey, limit, { config }) => {
	const qLimit = limit && `page[limit]=${limit}` || ''

	const baseUrl = `${config.get('BASE_URL')}${path}`
	const queryParams = [
		offsetKey && `page[offset]=${offsetKey}`,
		qLimit,
	].filter(Boolean).join('&')

	return {
		first: `${baseUrl}${qLimit ? '?' : ''}${qLimit}`,
		last: null,
		prev: null,
		next: offsetKey
			? `${baseUrl}${queryParams ? '?' : ''}${queryParams}`
			: null,
	}
}
