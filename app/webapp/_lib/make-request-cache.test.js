import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { makeRequestCache } from './make-request-cache.js'
import EventEmitter from 'events'

test('making a request caches response until state change happens', async () => {
	const emitter = new EventEmitter()

	let i = 0
	const get = makeRequestCache(emitter, async () => ++i)
	assert.is(i, 0, 'has not incremented yet')
	assert.is(await get(), 1, 'calling it runs the function')
	assert.is(i, 1, 'has incremented once')
	assert.is(await get(), 1, 'calling it again does not run the function')
	assert.is(i, 1, 'has not incremented')

	emitter.emit('stateChangeEnd')

	assert.is(await get(), 2, 'calling it after state change increments')
	assert.is(i, 2, 'has incremented')
})

test('making multiple caches does not mix state', async () => {
	const emitter = new EventEmitter()

	let i = 3
	let j = 7
	const getI = makeRequestCache(emitter, async () => ++i)
	const getJ = makeRequestCache(emitter, async () => ++j)

	assert.is(await getI(), 4, 'calling it runs the function')
	assert.is(i, 4, 'has incremented once')
	assert.is(j, 7, 'has not incremented')
	assert.is(await getI(), 4, 'calling it again does not run the function')
	assert.is(i, 4, 'has incremented once')
	assert.is(j, 7, 'has not incremented')

	assert.is(await getJ(), 8, 'calling it runs the function')
	assert.is(i, 4, 'has not incremented')
	assert.is(j, 8, 'has incremented once')
	assert.is(await getJ(), 8, 'calling it again does not run the function')
	assert.is(i, 4, 'has not incremented')
	assert.is(j, 8, 'has incremented once')

	emitter.emit('stateChangeEnd')

	assert.is(await getI(), 5, 'calling it after state change runs the function')
	assert.is(i, 5, 'has incremented once')
	assert.is(j, 8, 'has not incremented')
	assert.is(await getJ(), 9, 'calling it after state change runs the function')
	assert.is(i, 5, 'has not incremented')
	assert.is(j, 9, 'has incremented once')
})

test.run()
