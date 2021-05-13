import crypto from 'crypto'

export default async (...args) => crypto.webcrypto.getRandomValues(...args)
