import { test } from 'uvu'
import AJV from 'ajv'
import schema from './session.model.js'

const ajv = new AJV()

test('the schema itself is valid', async () => {
	ajv.compile(schema)
})

test.run()
