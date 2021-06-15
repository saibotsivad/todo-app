import got from 'got'
import { setUserRoles } from '../../app/cloudflare-api/_lib/controller/user/set-user-roles.js'
import { lookupUserById } from '../../app/cloudflare-api/_lib/controller/user/lookup-by-id.js'

export default async (test, assert, state, services) => {
	test('user-roles: user does not have permission', async () => {
		const response = await got.get(state.userCreateEmailData.url, {
			headers: {
				cookie: state.cookie,
			},
			throwHttpErrors: false,
		})
		assert.isStatus(response, 403, 'user does not have sufficient roles to access ' + state.userCreateEmailData.url + ' ' + state.cookie)
	})

	test('user-roles: user is given permission to access email', async () => {
		try {
			await setUserRoles(services, {
				userId: state.user.id,
				updatedRoles: [
					'sentEmail:read:*',
				],
			})
			state.user = await lookupUserById(services, { userId: state.user.id })
		} catch (error) {
			console.error('Failure when trying to set user roles using controller.', error)
			throw error
		}

		const response = await got.get(state.userCreateEmailData.url, {
			headers: {
				cookie: state.cookie,
			},
			throwHttpErrors: false,
		})
		assert.isStatus(response, 200, 'user can access email')
		const { data } = JSON.parse(response.body)
		assert.ok(state.userCreateEmailData.url.includes(data.id), 'the sent email id is in the url')
		assert.equal(data.type, 'sentEmail', 'returns the correct structure')
		assert.equal(data.attributes.templateId, 'user-created.md', 'uses the correct template to send')
	})
}
