import got from 'got'

export default async (assert, state) => {
	const response = await got.post(
		`${state.baseUrl}/api/v1/auth/user`,
		{
			json: {
				email: state.userEmail,
				password: state.userPassword
			}
		}
	)
	assert.ok(response.body, 'there is a body response')
	const user = JSON.parse(response.body).data
	assert.ok(user.id, 'an id has been set')
	assert.is(user.type, 'user', 'correct type')
	assert.is(user.attributes.email, state.userEmail, 'correct email set')
	state.user = user
}
