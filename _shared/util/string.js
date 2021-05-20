/**
 * Capitalize a string
 * @param {String} string - The input string.
 * @returns {String} - The capitalized string.
 */
export const caps = string => string.toUpperCase()

/**
 * Given a normal string, e.g. JSON-ified data or whatnot, give
 * back a base64uri string.
 * @param {String} string - The normal string.
 * @returns {String} - The base64uri encoded string.
 */
export const stringToBase64Uri = string => base64ToBase64Uri(btoa(string))

/**
 * Given a base64uri string, give back the un-encoded string.
 * @param {String} base64Uri - The base64uri encoded string.
 * @returns {String} - The decoded string.
 */
export const base64UriToString = base64Uri => atob(base64UriToBase64(base64Uri))

/**
 * Given a base64 string, turn it into a base64uri string.
 * @param {String} base64String - The base64 string.
 * @returns {String} - The string turned into base64uri format.
 */
export const base64ToBase64Uri = base64String => base64String
	.replace(/\+/g, '-')
	.replace(/\//g, '_')
	.replace(/=/g, '')

/**
 * Given a base64uri string, turn it into a base64 string.
 * @param {String} base64UriString - The base64uri string.
 * @returns {String} base64uri - The string turned into base64 format.
 */
export const base64UriToBase64 = base64UriString => base64UriString
	.replace(/-/g, '+')
	.replace(/_/g, '/')
	// TODO need to re-add `=` buffers?

/**
 * Take a Uint8Array and turn it into a base64uri string.
 * @param {Uint8Array|ArrayBuffer} array - The input array.
 * @returns {String} - The capitalized string.
 */
export const arrayToBase64Uri = array => base64ToBase64Uri(btoa(String.fromCharCode.apply(null, array)))
