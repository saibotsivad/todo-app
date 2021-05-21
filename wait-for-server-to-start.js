import got from 'got'
import timers from 'timers/promises'

const url = process.env.BASE_URL

const waitForServerToStart = async () => {
	try {
		await got(url)
	} catch (error) {
		if (error.code === 'ECONNREFUSED') {
			console.log('Waiting for server to start...')
			await timers.setTimeout(500)
			await waitForServerToStart()
		} else {
			throw error
		}
	}
}

if (url) {
	waitForServerToStart()
		.then(() => {
			console.log('Server has started!')
			process.exit(0)
		})
		.catch(error => {
			console.error('Error waiting for server to start!', error)
			process.exit(1)
		})
}
