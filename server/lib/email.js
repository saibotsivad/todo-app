export const normalizeEmail = string => (string || '')
	.toLowerCase()
	.replace(/^\s*/, '')
	.replace(/\s*$/, '')
