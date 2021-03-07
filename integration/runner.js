import { suite } from 'uvu'
import * as assert from 'uvu/assert'

const scenarios = [
	'user-create',
	'user-login',
	'user-logout'
]

const mutableState = {
	userEmail: 'me@site.com',
	userPassword: 'batteryhorsestaple9001',
	baseUrl: 'http://localhost:3000' // TODO based on other stuff
}

for (const scenario of scenarios) {
	const test = suite(scenario)
	const run = await import(`./${scenario}/${scenario}.js`)
	await run.default(test, assert, mutableState)
	await test.run()
}
