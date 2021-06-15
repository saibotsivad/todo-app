import { dynamodb } from './app/cloudflare-api/_service/db.js'
import { spawn } from 'child_process'
import timers from 'timers/promises'

const TableName = process.env.DYNAMODB_TABLE_NAME

if (!TableName) {
	console.log('The env variable "DYNAMODB_TABLE_NAME" must be set.')
	process.exit(1)
}
if (!process.env.DYNAMODB_URL) {
	console.error('The env variable "DYNAMODB_URL" must be set.')
	process.exit(1)
}
if (!process.env.STAGE || [ 'develop', 'production' ].includes(process.env.STAGE)) {
	console.error('The env variable "STAGE" must be set, and to something other than "develop" or "production".')
	process.exit(1)
}

const db = dynamodb({ get: key => process.env[key] })

let needToRunInitialization = true
let interrupt

const checkIfDynamodbRunning = async () => {
	try {
		await db('ListTables', {})
	} catch (error) {
		if (error.code === 'ECONNREFUSED' || error.code === 'ECONNRESET') {
			console.log('Waiting for DynamoDB-local to start...')
			needToRunInitialization = true
			await timers.setTimeout(500)
			return checkIfDynamodbRunning()
		} else {
			console.error('Error occurred while waiting for DynamoDB-local to start.')
			throw error
		}
	}
}

const initialize = async () => {
	spawn('node', [ 'initialize-local-dynamodb.js' ], {
		stdio: [ 'ignore', 'inherit', 'inherit' ],
		shell: true,
	})
	spawn('node', [ 'set-email-templates.js' ], {
		stdio: [ 'ignore', 'inherit', 'inherit' ],
		shell: true,
	})
}

const watch = async () => {
	while (!interrupt) {
		await checkIfDynamodbRunning()
		if (needToRunInitialization) {
			console.log('Initializing...')
			await initialize()
			needToRunInitialization = false
			console.log('Done initializing DynamoDB-local')
		}
		await timers.setTimeout(100)
	}
}

watch()
	.then(() => {
		console.log(`Watching exited`)
		process.exit(0)
	})
	.catch(error => {
		console.log(`Watching failed`, error)
		process.exit(1)
	})
