/*

Each route may export an OpenAPI-compatible-ish security block
that looks something like this:

```js
import thing1 from 'path/to/thing1.js'
import thing2 from 'path/to/thing2.js'
import thing3 from 'path/to/thing3.js'

export const security = [
	// block 0
	[
		{
			type: thing1,
			scopes: []
		}
	],
	// block 1
	[
		{
			type: thing2,
			scopes: []
		},
		{
			type: thing3,
			scopes: []
		}
	]
]
```

Following the OpenAPI specs, the security blocks are evaluated
first to last: any passing block will short-circuit, but any
block must pass all inner blocks.

So for the above example, block 0 would evaluate first, and if
the `thing1` succeeded the route would be considered secure.
If it failed, we would need to evaluate both `thing2` and `thing3`
and both of those would need to succeed for block 1 to pass.

The authorize functions are responsible for adding to and mutating
the request object.

*/

export default async (services, security, request) => {
	const errors = []
	for (const block of security) {
		let successfulSectionCount = 0
		for (const section of block) {
			try {
				await section.authorize(services, request, section.scopes)
				successfulSectionCount++
			} catch (error) {
				// the security routes have the potential to pollute
				// logs with huge piles of unimporant entries, so we
				// elect to not log them here, but this does mean the
				// security functions need to be very carefully tested
				// console.error('error while securing function', error)
				errors.push(error)
			}
		}
		if (successfulSectionCount === block.length) {
			return null
		}
	}
	return errors
}
