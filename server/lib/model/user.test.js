import { test } from 'uvu'
import AJV from 'ajv'
import schema from './user.model.js'

const ajv = new AJV()

test('the schema itself is valid', async () => {
	ajv.compile(schema)
})

test.run()
