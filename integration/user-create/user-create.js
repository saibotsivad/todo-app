import got from 'got'
import { fetchEmail } from 'jmap-fetch-test-email'
import { fetchLocalEmail } from '../fetch-local-email.js'

export default async (test, assert, state) => {
	await test('user-create: creating a new user works', async () => {
		const response = await got.post(
			`${state.baseUrl}/api/v1/user`,
			{
				json: {
					email: state.userEmail,
					password: state.userWebappPassword,
				},
				throwHttpErrors: false,
			},
		)
		assert.isStatus(response, 201, 'gives created status code')
		assert.ok(response.body, 'there is a body response')
		const user = JSON.parse(response.body).data
		assert.ok(user.id, 'an id has been set')
		assert.is(user.type, 'user', 'correct type')
		assert.is(user.attributes.email, state.userEmail, 'correct email set')
		assert.equal(user.attributes.roles, [ 'user:read:{{currentUserId}}' ], 'there is only the default role')
		state.user = user

		const requestId = response.headers['api-request-id']
		assert.ok(requestId, 'the request id is set on the response header')

		const email = process.env.LOCAL_SES_FOLDER
			? await fetchLocalEmail({ requestId })
			: await fetchEmail({
				username: process.env.JMAP_USERNAME,
				password: process.env.JMAP_PASSWORD,
				hostname: process.env.JMAP_HOSTNAME,
				onRetry: count => { console.log('retrying looking for email', count) },
				find: emails => JSON.stringify(emails).includes(requestId),
			})
		assert.ok(email, 'the email was found eventually ' + requestId)
		state.userCreateEmailData = JSON.parse(email._html.split('<script type="application/ld+json">')[1].split('</script>')[0])
		assert.ok(state.userCreateEmailData.url.includes(requestId), 'the LD-JSON `url` contains the request id')
	})
}
