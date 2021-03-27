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
	baseUrl: process.env.BASE_URL || `http://localhost:${process.env.PORT || '3000'}`
}

console.log('Running integration tests for:', mutableState.baseUrl)

const run = async () => {
	for (const scenario of scenarios) {
		const test = suite(scenario)
		const run = await import(`./${scenario}/${scenario}.js`)
		await run.default(test, assert, mutableState)
		await test.run()
	}
}

const start = Date.now()
const time = () => `${Math.round((Date.now() - start) / 10) / 100}s`
run()
	.then(() => {
		console.log(`Completed successfully after ${time()}`)
		process.exit(0)
	})
	.catch(error => {
		console.error(`Error thrown after ${time()} running tests`, error)
	})
