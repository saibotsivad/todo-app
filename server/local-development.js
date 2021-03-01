require('source-map-support').install()

import { setupServer } from './setup-server.js'
import polka from 'polka'

const api = polka()

setupServer(api, { verbose: true, maxAge: 0 })

api.listen(3000, err => {
	if (err) throw err;
	console.log(`> Running on localhost:3000`)
})
