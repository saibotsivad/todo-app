import got from 'got'

export default async (test, assert, state) => {
	test('user-login: logging in works', async () => {
		const response = await got.post(
			`${state.baseUrl}/api/v1/auth/login`,
			{
				json: {
					email: state.userEmail,
					password: state.userPassword
				}
			}
		)
		assert.is(response.statusCode, 200, 'gives correct status code')
		assert.ok(response.body, 'there is a body response')
		const data = JSON.parse(response.body)
		assert.is(data.ok, true, 'just a simple ok response')
		assert.ok(response.headers['set-cookie'], 'the cookie exists')
		const matcher = /todoapp=([^;]+);/.exec(response.headers['set-cookie'])
		assert.ok(matcher, 'did find a regex match for cookie')
		state.cookie = `todoapp=${matcher[1]};`
	})
}
