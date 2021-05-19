import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { generateCookie, parseCookie } from './cookie.js'

test('generating and then parsing a cookie', () => {
	const cookie = generateCookie(
		{
			config: {
				get: key => {
					assert.is(key, 'NODE_ENV', 'correct property')
					return false
				},
			},
		},
		{
			userId: 'a',
			sessionId: 'b',
			sessionSecret: 'c',
			expirationDate: new Date('2021-04-23T12:34:00.000Z'),
			currentNow: 1619151240000,
		},
	)
	assert.is(typeof cookie, 'string', 'correct output format')
	assert.ok(new RegExp('Expires=Fri, 23 Apr 2021 12:34:00 GMT($|;)').test(cookie), 'the date is formatted correctly')
	assert.ok(new RegExp('Max-Age=30000($|;)').test(cookie), 'the max age is correct')
	const params = parseCookie(cookie)
	assert.is(params.userId, 'a')
	assert.is(params.sessionId, 'b')
	assert.is(params.sessionSecret, 'c')
})

test.run()
