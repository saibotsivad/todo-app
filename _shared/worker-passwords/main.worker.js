import { PBKDF2 } from 'worktop/crypto'
import getRandomValues from '../cf-shim/crypto/get-random-values.worker.js'
import { arrayToBase64Url } from '../util/string.js'

// Round count, key and salt lengths, and digest algorithm follow
// the recommendations of OWASP as of January 2018:
// https://www.owasp.org/index.php/Password_Storage_Cheat_Sheet
const DIGEST = 'SHA-512'
const KEY_LENGTH = 64
const ROUNDS = 10000
const SALT_LENGTH = 64

export const hashPassword = async ({ password }) => {
	const saltBytes = new Uint8Array(SALT_LENGTH)
	await getRandomValues(saltBytes)
	const saltString = arrayToBase64Url(saltBytes)
	const hashedBytes = await PBKDF2(DIGEST, password, saltString, ROUNDS, KEY_LENGTH)
	const hash = arrayToBase64Url(hashedBytes)
	return [ DIGEST, saltString, hash ].join('$')
}

export const validatePassword = async ({ hash, password }) => {
	try {
		const [ digest, salt, storedPassword ] = hash.split('$')
		const passwordBytesToCompare = await PBKDF2(digest, password, salt, ROUNDS, KEY_LENGTH)
		return storedPassword === arrayToBase64Url(passwordBytesToCompare)
	} catch (ignore) {
		// an error during hashing is equivalent to an invalid password
	}
	return false
}

export const generatePassword = async () => {
	const keyBytes = new Uint8Array(KEY_LENGTH)
	await getRandomValues(keyBytes)
	return arrayToBase64Url(keyBytes)
}
