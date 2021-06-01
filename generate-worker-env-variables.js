import { requiredEnvironmentVariables, checkEnvironmentVariables } from './app/cloudflare-api/_lib/environment-variables.js'

const notSet = checkEnvironmentVariables(process.env)
if (notSet) {
	console.log(notSet)
	process.exit(1)
}

const configValues = requiredEnvironmentVariables
	.reduce((map, key) => {
		map[key] = process.env[key]
		return map
	}, {})

console.log('Copy this JSON out to the environment variable: API_CONFIGURATION')

console.log(JSON.stringify(configValues))
