import got from 'got'

export default async (test, assert, state) => {
	test('user-login: no authentication means no user', async () => {
		const response = await got.get(`${state.baseUrl}/api/v1/auth/user`, {
			throwHttpErrors: false,
		})
		assert.isStatus(response, 401, 'gives unauthenticated status code')
	})

	test('user-login: logging in works', async () => {
		const response = await got.post(
			`${state.baseUrl}/api/v1/auth/login`,
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
		const data = JSON.parse(response.body)
		assert.is(data.ok, true, 'just a simple ok response')
		assert.ok(response.headers['set-cookie'], 'the cookie exists')
		const matcher = /todojournal=([^;]+);/.exec(response.headers['set-cookie'].toString())
		assert.ok(matcher, 'did find a regex match for cookie')
		state.cookie = response.headers['set-cookie']
	})

	test('user-login: user can fetch self', async () => {
		const response = await got.get(`${state.baseUrl}/api/v1/auth/user`, {
			headers: {
				cookie: state.cookie,
			},
			throwHttpErrors: false,
		})
		assert.isStatus(response, 200, 'gives ok status code')
		assert.ok(response.body, 'there is a body response')
		const user = JSON.parse(response.body).data
		assert.is(user.id, state.user.id, 'requested user matches test user')
	})
}
