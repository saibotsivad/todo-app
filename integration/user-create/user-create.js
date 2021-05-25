import got from 'got'

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
	})
}
