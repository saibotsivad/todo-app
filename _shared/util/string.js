/**
 * Capitalize a string
 * @param {String} string - The input string.
 * @returns {String} - The capitalized string.
 */
export const caps = string => string.toUpperCase()

/**
 * Given a normal string, e.g. JSON-ified data or whatnot, give
 * back a base64url string.
 * @param {String} string - The normal string.
 * @returns {String} - The base64url encoded string.
 */
export const stringToBase64Url = string => base64ToBase64Url(btoa(string))

/**
 * Given a base64url string, give back the un-encoded string.
 * @param {String} base64Url - The base64url encoded string.
 * @returns {String} - The decoded string.
 */
export const base64UrlToString = base64Url => atob(base64UrlToBase64(base64Url))

/**
 * Given a base64 string, turn it into a base64url string.
 * @param {String} base64String - The base64 string.
 * @returns {String} - The string turned into base64url format.
 */
export const base64ToBase64Url = base64String => base64String
	.replace(/\+/g, '-')
	.replace(/\//g, '_')
	.replace(/=/g, '')

/**
 * Given a base64url string that's been converted back to base64, we still
 * need to make sure that the end is padded with '=' characters out to the
 * correct length.
 * @param {String} string - The unpadded base64 string.
 * @returns {String} - The padded base 64 string.
 */
const padString = string => {
	const difference = string.length % 4
	if (!difference) return string
	return string.padEnd(string.length + 4 - difference, '=')
}

/**
 * Given a base64url string, turn it into a base64 string.
 * @param {String} base64UrlString - The base64url string.
 * @returns {String} base64url - The string turned into base64 format.
 */
export const base64UrlToBase64 = base64UrlString => padString(base64UrlString
	.replace(/-/g, '+')
	.replace(/_/g, '/'))

/**
 * Take a Uint8Array and turn it into a base64url string.
 * @param {Uint8Array|ArrayBuffer} array - The input array.
 * @returns {String} - The capitalized string.
 */
export const arrayToBase64Url = array => base64ToBase64Url(btoa(String.fromCharCode.apply(null, array)))
