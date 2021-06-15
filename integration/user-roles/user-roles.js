import got from 'got'

export default async (test, assert, state) => {
	test('user-roles: user does not have permission', async () => {
		const response = await got.get(state.userCreateEmailData.url, {
			headers: {
				cookie: state.cookie,
			},
			throwHttpErrors: false,
		})
		assert.isStatus(response, 403, 'user does not have sufficient roles to access ' + state.userCreateEmailData.url + ' ' + state.cookie)
	})
}
