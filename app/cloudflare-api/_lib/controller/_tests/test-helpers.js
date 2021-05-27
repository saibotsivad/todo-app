import { dynamodb } from '@/service/db.js'

const config = { get: key => process.env[key] }
const db = dynamodb(config)
const TableName = process.env.DYNAMODB_TABLE_NAME

export const services = { config, db, SDate: Date }

export const listAllData = async (verbose, removeAll) => {
	const allData = await db('Scan', { TableName })
	console.log(`Found ${allData.data.Items && allData.data.Items.length || 0} items.`)
	for (const item of (allData.data && allData.data.Items || [])) {
		if (verbose) console.log(JSON.stringify(item, undefined, 2))
		if (verbose) console.log('----------')
		if (!verbose) console.log(`- pk=(${item.pk.S}) sk=(${item.sk.S})`)
		if (removeAll) await db('DeleteItem', { TableName, Key: { pk: item.pk, sk: item.sk } })
	}
}

export const run = (verbose, runner) => {
	const vlog = (...args) => { verbose && console.log(...args) }
	const assert = (message, bool) => { console.log(message, bool) }
	runner({ vlog, assert })
		.then(() => {
			console.log('Success running controller tests.')
			process.exit(0)
		})
		.catch(error => {
			console.error('Error thrown while trying to run controller tests.', error)
			process.exit(1)
		})
}
