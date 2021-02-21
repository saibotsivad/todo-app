// import createUser from './server/lib/controller/user/create-user.js'
import lookupByEmail from './server/lib/controller/user/lookup-by-email.js'

lookupByEmail({
	email: 'Aabc@site.com',
	// password: 'batteryhorsestaple123'
})
.then(result => {
	console.log('done!', result)
})
.catch(error => {
	console.error('error!', error)
})
