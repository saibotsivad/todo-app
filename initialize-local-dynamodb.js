import { dynamodb } from './app/cloudflare-api/_service/db.js'
import fs from 'fs/promises'
import get from 'dlv'
import timers from 'timers/promises'
import yaml from 'js-yaml'

const TableName = process.env.DYNAMODB_TABLE_NAME

const db = dynamodb({ get: key => process.env[key] })

const waitForDynamoDbToStart = async () => {
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

	try {
		await db('ListTables', {})
	} catch (error) {
		if (error.code === 'ECONNREFUSED' || error.code === 'ECONNRESET') {
			console.log('Waiting for Docker container to start...')
			await timers.setTimeout(500)
			return waitForDynamoDbToStart()
		} else {
			console.error('Error occurred while waiting for DynamoDB-local to start.')
			throw error
		}
	}
}

const createTable = async () => {
	const serverless = yaml.load(await fs.readFile('./deploy/aws-services/serverless.yml', 'utf8'))
	const { AttributeDefinitions, KeySchema, BillingMode } = get(serverless, 'resources.Resources.dataTable.Properties')

	const result = await db('CreateTable', {
		AttributeDefinitions,
		KeySchema,
		BillingMode,
		TableName,
	})
	if (result && result.data && result.data.TableDescription && result.data.TableDescriptionresult && result.data.TableDescription.TableArn) {
		console.log(JSON.stringify(result, undefined, 2))
		throw new Error('Error while creating table.')
	}
}

const tableHasBeenCreated = async () => {
	const result = await db('DescribeTable', { TableName })
	return result && result.data && result.data.Table && result.data.Table.TableStatus === 'ACTIVE'
}

const initialize = async () => {
	await waitForDynamoDbToStart()
	await createTable()
	let created
	while (!created) {
		created = await tableHasBeenCreated()
		if (!created) {
			console.log('Waiting 1s for local table creation to finish...')
			await timers.setTimeout(1000)
		}
	}
}

if (process.env.DYNAMODB_URL) {
	const start = Date.now()
	initialize()
		.then(() => {
			console.log(`Completed successfully after ${Date.now() - start}ms`)
			process.exit(0)
		})
		.catch(error => {
			console.log(`Initialization failed after ${Date.now() - start}ms:`, error)
			process.exit(1)
		})
}
