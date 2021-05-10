const workerKeys = {
	LOG_LEVEL: 'error',
	NODE_ENV: 'production',
	IS_DEPLOYED: 'true'
}

export const get = key => workerKeys[key]
