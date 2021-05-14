/*

The subject of cookies is complicated and arduous, but some helpful
links I have found on the subject are:

- https://odino.org/security-hardening-http-cookies/
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie

*/

import { encode, decode } from '@/lib/base64uri.js'

// The name of the cookie doesn`t matter a whole lot, but it
// makes sense to have it be related to your application, for
// easier debugging.
const COOKIE_NAME = 'todo-journal'

// The cookies "value" is a base64uri encoded, JSON
// stringified object containing the user id and the
// session id.
const generateCookieValue = ({ userId, sessionId, sessionSecret }) => encode(
	JSON.stringify({
		uid: userId,
		sid: sessionId,
		pw: sessionSecret,
	}),
)

const secureCookieParts = ({ config }) => config.get('NODE_ENV') === 'production'
	? [
		// The `path` key is not necessary right away, but it might be used to
		// constrain cookies to `/api/*` for additional security constraints.
		// For now we'll be explicit that it's available on all paths.
		'Path=/',

		// When developing locally, the API is run with this environment
		// variable set, via the `package.json` run scripts. If that's not
		// set then cookies must be set via HTTPS only.
		'Secure',

		// Setting the `HttpOnly` flag instructs the browser not to share
		// the cookie with the browser's JavaScript, which could be used
		// by third-party scripts to hijack things.
		'HttpOnly',

		// Setting this property declares your cookie should be restricted
		// to a first-party or same-site context.
		'SameSite',
	]
	: []

export const generateCookie = (services, { userId, sessionId, sessionSecret, expirationDate, currentNow = Date.now() }) => {

	return [
		`${COOKIE_NAME}=${generateCookieValue({ userId, sessionId, sessionSecret })}`,

		// The `Expires` field specifies when a cookie should expire, so that
		// browsers do not store and transmit it indefinitely. It is expressed
		// as a formatted date string in this format:
		//
		//     <DayName>, <DayNumber> <MonthName> <Year> <24Hour>:<Minute>:<Second> GMT
		//
		// Example:
		//
		//     Tue, 23rd Feb 2021 00:00:00 GMT
		//
		`Expires=${expirationDate.toUTCString()}`,

		// Similarly, the `Max-Age` property specifies the number of seconds
		// until the cookie should expire.
		`Max-Age=${Math.round((expirationDate.getTime() - currentNow) / 1000)}`,

		// When this is deployed to production, or a development branch, the
		// domain name should be pinned. But when running locally, pinning it
		// mostly just makes life difficult for the developer.
		// TODO: `domain=<domain_name>`,

		...secureCookieParts(services),

		// Filter out the ones not set and compose.
	].filter(Boolean).join('; ')
}

export const generateExpiredCookie = (services) => ([
	`${COOKIE_NAME}=expired`,
	`Expires=${new Date().toUTCString()}`,
	'Max-Age=0',
	...secureCookieParts(services),
].filter(Boolean).join('; '))

export const parseCookie = string => {
	try {
		const base64 = (string || '')
			.split(';')
			.map(s => s.trim())
			.find(s => s.startsWith(`${COOKIE_NAME}=`))
			.split('=')[1]
		const { uid, sid, pw } = JSON.parse(decode(base64))
		return {
			userId: uid,
			sessionId: sid,
			sessionSecret: pw,
		}
	} catch (ignore) {
		return null
	}
}
