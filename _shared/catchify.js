/**
 * Wrap and await a promise for easier code layout. Returns an array
 * with the error first and result second:
 *
 * ```js
 * import { catchify } from '@/shared/catchify.js'
 * const [ error, result ] = await catchify(myCoolPromise)
 * ```
 *
 * @param {Promise<T>} p - The non-awaited promise.
 * @returns {Promise<[null, T] | [any]>} - The error-first array result.
 */
export const catchify = async p => Promise
	.resolve(p)
	.then(
		result => ([ null, result ]),
		error => ([ error ])
	)
