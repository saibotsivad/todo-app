/* global globalThis */
import * as assert from 'uvu/assert'
import { dynamodb } from '../app/cloudflare-api/_service/db.js'
import { ses } from '../app/cloudflare-api/_service/email.js'
import log from '../app/cloudflare-api/_service/log.js'

// eslint-disable-next-line no-import-assign
const runnerAssert = Object.assign({}, assert)
runnerAssert.isStatus = (response, expected, message) => {
	if (response.statusCode !== expected) {
		let responseBody = typeof response.body === 'object'
			? JSON.stringify(response.body, undefined, 2)
			: response.body
		if (typeof response.body === 'string') {
			try {
				responseBody = JSON.stringify(JSON.parse(response.body), undefined, 2)
			} catch (error) {
				console.log('body was string but not valid json')
			}
		}
		assert.snapshot(responseBody, '!', `[BAD STATUS CODE: expected=${expected}, actual=${response.statusCode}] ${message}`)
	}
	assert.is(response.statusCode, expected, message)
}

const scenarios = [
	'user-create',
	'user-login',
	'user-roles',
	'user-logout',
]

const mutableState = {
	userEmail: `integrationtesting+todojournal-${process.env.STAGE || 'local'}@tobiaslabs.com`,
	userWebappPassword: 'correct-battery-horse-staple-9001',
	baseUrl: process.env.BASE_URL || `http://localhost:${process.env.PORT || '3000'}`,
}

console.log('Running integration tests for:', mutableState.baseUrl)

const logProps = props => {
	console.log('Required: ' + props.join(', '))
	console.log('Not set: ' + props.filter(prop => !process.env[prop]).join(', '))
}

const jmapProps = [
	'JMAP_USERNAME',
	'JMAP_PASSWORD',
	'JMAP_HOSTNAME',
]
if (!process.env.LOCAL_SES_FOLDER && !jmapProps.every(prop => process.env[prop])) {
	console.log('You either need to set LOCAL_SES_FOLDER for offline testing, or set all JMAP properties.')
	logProps(jmapProps)
	process.exit(1)
}

const awsProps = [
	'AWS_REGION',
	'AWS_SECRET_ACCESS_KEY',
	'AWS_ACCESS_KEY_ID',
	'DYNAMODB_TABLE_NAME',
]
if (!awsProps.every(prop => process.env[prop])) {
	console.log('To run some of the integration tests, such as the user-roles tests, you need read+write access to DynamoDB.')
	logProps(awsProps)
	process.exit(1)
}

const config = { get: key => process.env[key] }

const services = {
	db: dynamodb(config),
	email: ses(config),
	config,
	log,
	SDate: Date,
}

const run = async () => {
	// Note the reference to `globalThis.UVU_*` is to manage suite
	// flow, since `uvu` doesn't fully support that yet.
	// More info: https://github.com/lukeed/uvu/issues/113
	globalThis.UVU_DEFER = 1
	const uvu = await import('uvu')
	for (const scenario of scenarios) {
		const count = globalThis.UVU_QUEUE.push([ scenario ])
		globalThis.UVU_INDEX = count - 1
		const test = uvu.suite(scenario)
		const run = await import(`./${scenario}/${scenario}.js`)
		run.default(test, runnerAssert, mutableState, services)
		test.run()
	}
	return uvu.exec()
}

const start = Date.now()
const time = () => `${Math.round((Date.now() - start) / 10) / 100}s`
run()
	.then(() => {
		// `uvu` doesn't return the test suite statuses with `exec` but it
		// does set `process.exitCode` so we can use that here
		// More info: https://github.com/lukeed/uvu/issues/113
		console.log(`Completed ${process.exitCode ? 'with failing tests' : 'successfully'} after ${time()}`)
		process.exit(process.exitCode)
	})
	.catch(error => {
		console.error(`Error thrown after ${time()} running tests`, error)
		process.exit(1)
	})
