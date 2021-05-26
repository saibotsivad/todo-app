import got from 'got'

export default async (test, assert, state) => {
	test('user-logout: logging out sets expired cookie', async () => {
		const response = await got.get(`${state.baseUrl}/api/v1/logout`, {
			headers: {
				cookie: state.cookie,
			},
			throwHttpErrors: false,
		})
		assert.isStatus(response, 200, 'gives ok status code')
		assert.ok(response.body, 'there is a body response')
		const data = JSON.parse(response.body)
		assert.is(data.ok, true, 'just a simple ok response')
		assert.ok(response.headers['set-cookie'], 'the cookie exists')
		const matcher = /todojournal=([^;]+);/.exec(response.headers['set-cookie'])
		assert.ok(matcher, 'did find a regex match for cookie')
		assert.is(matcher[1], 'expired', 'the cookie does not contain session info')
	})

	test('user-logout: logged out user cannot fetch self', async () => {
		const response = await got.get(`${state.baseUrl}/api/v1/user`, {
			headers: {
				cookie: state.cookie,
			},
			throwHttpErrors: false,
		})
		assert.isStatus(response, 401, 'gives unauthenticated status code')
	})
}
