import getRandomValues from '@/shared/cf-shim/crypto/get-random-values.node.js'

// loosely copied from: https://github.com/novemberborn/ksuid/blob/master/index.js
// which had the MIT license at the time of copying

// KSUID's epoch starts more recently so that the 32-bit number space gives a
// significantly higher useful lifetime of around 136 years from March 2014.
// This number (14e11) was picked to be easy to remember.
const EPOCH_IN_MS = 14e11

const TIMESTAMP_BYTE_LENGTH = 4 // Timestamp is a uint32
const PAYLOAD_BYTE_LENGTH = 16
const BYTE_LENGTH = TIMESTAMP_BYTE_LENGTH + PAYLOAD_BYTE_LENGTH // KSUIDs are 20 bytes when binary encoded

const generate = async () => {
	let array = new Uint8Array(PAYLOAD_BYTE_LENGTH)
	return getRandomValues(array)
}

export const ksuid = async () => {
	const timestamp = Math.floor((Date.now() - EPOCH_IN_MS) / 1e3)
	const timestampBuffer = Buffer.allocUnsafe(TIMESTAMP_BYTE_LENGTH)
	timestampBuffer.writeUInt32BE(timestamp, 0)
	return Buffer.concat([ timestampBuffer, await generate() ], BYTE_LENGTH).toString('base64')
}
