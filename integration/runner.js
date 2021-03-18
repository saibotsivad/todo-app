import { suite } from 'uvu'
import * as assert from 'uvu/assert'

const scenarios = [
	'user-create',
	'user-login',
	'user-get',
	'user-logout'
]

const mutableState = {
	userEmail: 'me@site.com',
	userPassword: 'batteryhorsestaple9001',
	baseUrl: process.env.BASE_URL || `http://localhost:${process.env.PORT || '3000'}`
}

for (const scenario of scenarios) {
	const test = suite(scenario)
	const run = await import(`./${scenario}/${scenario}.js`)
	await run.default(test, assert, mutableState)
	await test.run()
}
