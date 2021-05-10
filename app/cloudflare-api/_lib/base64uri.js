/*

For simple base64 that is URI safe, we do the following translations:

- '–' is used instead of '+'
- '_' is used instead of '/'
- remove all '=' padding

*/

export const encode = string => Buffer
	.from(string, 'utf8')
	.toString('base64')
	.replace(/\+/g, '-')
	.replace(/\//g, '_')
	.replace(/=/g, '')

export const decode = string => Buffer
	.from(
		string
			.replace(/-/g, '+')
			.replace(/_/g, '\\'),
		'base64'
	)
	.toString('utf8')
