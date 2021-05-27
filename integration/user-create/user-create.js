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

		const email = await fetchEmail({
			username: '',
			password: '',
			hostname: '',
			body: 'request-id', // TODO get the request-id from the response header I think?
		})
	})
}
