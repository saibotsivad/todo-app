import crypto from 'crypto'
import { promisify } from 'util'

const pbkdf2 = promisify(crypto.pbkdf2)
const randomBytes = promisify(crypto.randomBytes)

// Round count, key and salt lengths, and digest algorithm follow
// the recommendations of OWASP as of January 2018:
// https://www.owasp.org/index.php/Password_Storage_Cheat_Sheet
const DIGEST = 'sha512'
const KEY_LENGTH = 64
const ROUNDS = 10000
const SALT_LENGTH = 64

export const hashPassword = async ({ password }) => {
	const saltBytes = await randomBytes(SALT_LENGTH)
	const saltString = saltBytes.toString('hex')
	const hash = await pbkdf2(password, saltString, ROUNDS, KEY_LENGTH, DIGEST)
	return [ DIGEST, saltString, hash.toString('hex') ].join('$')
}

export const validatePassword = async ({ hash, password }) => {
	try {
		const [ digest, salt, storedPassword ] = hash.split('$')
		if (digest && salt && storedPassword) {
			const passwordToCompare = await pbkdf2(password, salt, ROUNDS, KEY_LENGTH, digest)
			return passwordToCompare.toString('hex') === storedPassword
		}
	} catch (ignore) {
		// an error during hashing is equivalent to an invalid password
	}
	return false
}

export const generatePassword = async () => {
	const bytes = await randomBytes(KEY_LENGTH)
	return bytes.toString('base64')
}
