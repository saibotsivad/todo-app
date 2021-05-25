import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { paginatedLinks } from './paginated-links.js'

const services = {
	config: {
		get: () => 'https://site.com',
	},
}

test('generating paginated links with no offset or limit', async () => {
	const { first, last, prev, next } = paginatedLinks('/foo', undefined, undefined, services)
	assert.equal(first, 'https://site.com/foo', 'just the path with nothing on it')
	assert.equal(last, null, 'last is not knowable')
	assert.equal(prev, null, 'previous is not knowable')
	assert.equal(next, null, 'there is no next here')
})

test('generating paginated links with no offset but there is a limit', async () => {
	const { first, last, prev, next } = paginatedLinks('/foo', undefined, 3, services)
	assert.equal(first, 'https://site.com/foo?page[limit]=3', 'the path with the limit on it')
	assert.equal(last, null, 'last is not knowable')
	assert.equal(prev, null, 'previous is not knowable')
	assert.equal(next, null, 'there is no next here')
})

test('generating paginated links with an offset but no limit', async () => {
	const { first, last, prev, next } = paginatedLinks('/foo', 'bar', undefined, services)
	assert.equal(first, 'https://site.com/foo', 'just the path with nothing on it')
	assert.equal(last, null, 'last is not knowable')
	assert.equal(prev, null, 'previous is not knowable')
	assert.equal(next, 'https://site.com/foo?page[offset]=bar', 'next includes offset')
})

test('generating paginated links with an offset and limit', async () => {
	const { first, last, prev, next } = paginatedLinks('/foo', 'bar', 3, services)
	assert.equal(first, 'https://site.com/foo?page[limit]=3', 'the path with the limit on it')
	assert.equal(last, null, 'last is not knowable')
	assert.equal(prev, null, 'previous is not knowable')
	assert.equal(next, 'https://site.com/foo?page[offset]=bar&page[limit]=3', 'next includes offset and limit')
})

test.run()
