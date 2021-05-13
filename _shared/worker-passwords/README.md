# worker crypto

This is based on https://github.com/AggressivelyMeows/cfw-easy-utils/blob/main/src/secrets.js#L43

Basically, it's a tool to hash and validate passwords, the API to use it being the same in NodeJS and Workers.

```js
import { hashPassword } from '@/shared/worker-passwords.js'

const secure = await hashPassword(
	'battery-horse-staple',
	// optional
	{
		iterations: 10000
	}
)
```

The output `secure` is a [bcrypt formatted string](https://en.wikipedia.org/wiki/Bcrypt), it will be 59 or 60 bytes long.

The modular crypt format has `$` at the beginning and end, and contains parts separated by `$`, so you could do this:

```js
const [ _, algorithm, cost, saltAndHash ] = secure.split('$')
const salt = saltAndHash.slice(0, 22)
const hash = saltAndHash.slice(23, 31)
```
