import 'source-map-support/register.js'
import { setupServer } from './setup-server.js'
import polka from 'polka'

const requiredEnvironmentVariables = [
	'AWS_ACCOUNT_ID',
	'AWS_REGION',
	'AWS_ACCESS_KEY_ID',
	'AWS_SECRET_ACCESS_KEY',
	'TABLE_NAME',
]

if (!requiredEnvironmentVariables.every(key => process.env[key])) {
	console.log('Some environment variables are not set.')
	console.log('Required: ' + requiredEnvironmentVariables.join(', '))
	console.log('Not set: ' + requiredEnvironmentVariables.filter(key => !process.env[key]).join(', '))
	process.exit(1)
}

const api = polka()

setupServer(api, { verbose: true, maxAge: 0 })

api.listen(3000, err => {
	if (err) throw err;
	console.log(`> Running on localhost:3000`)
})
