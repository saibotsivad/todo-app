import 'source-map-support/register.js'
import { setupServer } from './setup-server.js'
import polka from 'polka'
import { generateIndex } from '../cloudflare-static/generate-index.js'
import { db } from '@/service/db.js'
import log from '@/service/log.js'

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

configValues.BUILD_PREFIX = 'localhost:3000/fizz/'

const config = {
	get: async key => configValues[key]
}

const api = polka()

setupServer({ db, config, log }, api)

api.get('/', (req, res) => {
	res.setHeader('Content-Type', 'text/html')
	res.end(generateIndex('localhost:3000/___static/'))
})

const port = parseInt(process.env.PORT || '3000', 10)

api.listen(port, error => {
	if (error) {
		throw error
	}
	console.log(`> Running on localhost:${port}`)
})
