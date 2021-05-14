import got from 'got'

export default async (test, assert, state) => {
	test('user-logout: logging out sets expired cookie', async () => {
		console.log('------------', state.cookie)
		const response = await got.get(`${state.baseUrl}/api/v1/auth/logout`, {
			headers: {
				cookie: state.cookie,
			},
		})
		assert.is(response.statusCode, 200, 'gives correct status code')
		assert.ok(response.body, 'there is a body response')
		const data = JSON.parse(response.body)
		assert.is(data.ok, true, 'just a simple ok response')
		assert.ok(response.headers['set-cookie'], 'the cookie exists')
		const matcher = /todojournal=([^;]+);/.exec(response.headers['set-cookie'])
		assert.ok(matcher, 'did find a regex match for cookie')
		assert.is(matcher[1], 'expired', 'the cookie does not contain session info')
	})

	test('user-logout: logged out user cannot fetch self', async () => {
		const response = await got.get(`${state.baseUrl}/api/v1/auth/user`, {
			headers: {
				cookie: state.cookie,
			},
			throwHttpErrors: false,
		})
		assert.is(response.statusCode, 401, 'gives unauthenticated status code')
	})
}
