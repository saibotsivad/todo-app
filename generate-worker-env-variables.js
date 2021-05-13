const requiredEnvironmentVariables = [
	'AWS_ACCOUNT_ID',
	'AWS_REGION',
	'AWS_ACCESS_KEY_ID',
	'AWS_SECRET_ACCESS_KEY',
	'TJ_TABLE_NAME',
	'TJ_API_DOMAIN'
]

if (!requiredEnvironmentVariables.every(key => process.env[key])) {
	console.log('Some environment variables are not set.')
	console.log('Required: ' + requiredEnvironmentVariables.join(', '))
	console.log('Not set: ' + requiredEnvironmentVariables.filter(key => !process.env[key]).join(', '))
	process.exit(1)
}

const configValues = requiredEnvironmentVariables
	.concat([
		'NODE_ENV'
	])
	.reduce((map, key) => {
		map[key] = process.env[key]
		return map
	}, {})

console.log('Copy this JSON out to the environment variable: TODO_JOURNAL_CONFIGURATION')

console.log(JSON.stringify(configValues))
