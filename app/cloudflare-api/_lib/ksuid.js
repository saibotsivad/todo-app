import getRandomValues from '@/shared/cf-shim/crypto/get-random-values.node.js'

// loosely copied from: https://github.com/novemberborn/ksuid/blob/master/index.js
// which had the MIT license at the time of copying

// KSUID's epoch starts more recently so that the 32-bit number space gives a
// significantly higher useful lifetime of around 136 years from March 2014.
// This number (14e11) was picked to be easy to remember.
const EPOCH_IN_MS = 14e11

const PAYLOAD_BYTE_LENGTH = 16

function numberToByteArray(number) {
	let int = BigInt(number)
	const result = []
	while (int > 0n) {
		result.push(Number(int % 0x100n))
		int /= 0x100n
	}
	return Uint8Array.from(result.reverse())
}

export const ksuid = () => {
	const timestamp = Math.floor((Date.now() - EPOCH_IN_MS) / 1e3)
	const timestampArray = numberToByteArray(timestamp)
	const dataArray = new Uint8Array(PAYLOAD_BYTE_LENGTH)
	getRandomValues(dataArray)
	const allBytes = [ ...timestampArray, ...dataArray ]
	return btoa(String.fromCharCode.apply(null, allBytes))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=/g, '')
}
