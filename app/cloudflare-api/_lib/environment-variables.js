export const requiredEnvironmentVariables = [
	'AWS_ACCOUNT_ID',
	'AWS_REGION',
	'AWS_ACCESS_KEY_ID',
	'AWS_SECRET_ACCESS_KEY',
	'BASE_URL',
	'LOG_LEVEL',
	'NODE_ENV',
	'STAGE',
	'ADMIN_EMAIL_ADDRESS',
	'API_DOMAIN',
	'DYNAMODB_TABLE_NAME',
]

export const checkEnvironmentVariables = obj => {
	const notSet = requiredEnvironmentVariables.filter(variable => obj[variable] === undefined)
	return notSet.length
		? ('Some environment variables are not set.\n Required: ' + requiredEnvironmentVariables.join(', ') + '\nNot set: ' + notSet.join(', '))
		: false
}
