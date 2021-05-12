/*

For simple base64 that is URI safe, we do the following translations:

- '–' is used instead of '+'
- '_' is used instead of '/'
- remove all '=' padding

*/

export const encode = string => btoa(string)
	.replace(/\+/g, '-')
	.replace(/\//g, '_')
	.replace(/=/g, '')

export const decode = string => atob(
	string
		.replace(/-/g, '+')
		.replace(/_/g, '\\')
)
	.toString('utf8')
