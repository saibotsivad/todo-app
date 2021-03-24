import makeCache from 'lib/cache-get-request.js'
import { get, post } from 'lib/json-fetch.js'

const cache = makeCache()

export const getCurrentUser = cache(
	() => get('/api/v1/auth/user').then(response => response.body.data)
)

export const login = async ({ email, password }) => post('/api/v1/auth/login', {
	body: { email, password }
})

export const logout = async () => get('/api/v1/auth/logout')

export const createUser = async ({ email, password }) => post('/api/v1/auth/user', {
	body: { email, password }
})

export const forgotPassword = async ({ email }) => post('/api/v1/auth/forgotPassword', {
	body: { email }
})
