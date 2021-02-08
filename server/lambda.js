import { setupServer } from './setup-server.js'
import serverless from 'serverless-http'
import polka from 'polka'

export default () => {
	const api = polka()
	setupServer(api)
	return serverless(api)
}
