import got from 'got'

export default async (test, assert, state) => {
	await test('user-create: creating a new user works', async () => {
		const response = await got.post(
			`${state.baseUrl}/api/v1/auth/user`,
			{
				json: {
					email: state.userEmail,
					password: state.userPassword,
				},
			},
		)
		assert.is(response.statusCode, 201, 'gives correct status code')
		assert.ok(response.body, 'there is a body response')
		const user = JSON.parse(response.body).data
		assert.ok(user.id, 'an id has been set')
		assert.is(user.type, 'user', 'correct type')
		assert.is(user.attributes.email, state.userEmail, 'correct email set')
		state.user = user
	})
}
