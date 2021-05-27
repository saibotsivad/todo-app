import got from 'got'
import { fetchEmail } from 'jmap-fetch-test-email'

export default async (test, assert, state) => {
	await test('user-create: creating a new user works', async () => {
		const response = await got.post(
			`${state.baseUrl}/api/v1/user`,
			{
				json: {
					email: state.userEmail,
					password: state.userPassword,
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
		state.user = user
		assert.ok(response.headers['api-request-id'], 'the request id is set on the response header')

		const email = process.env.RUNNING_OFFLINE
			? todo_read_from_disk_presumably(response.headers['api-request-id'])
			: await fetchEmail({
				username: process.env.JMAP_USERNAME,
				password: process.env.JMAP_PASSWORD,
				hostname: process.env.JMAP_HOSTNAME,
				body: response.headers['api-request-id'],
			})
		assert.ok(email, 'the email was found eventually')
	})
}
