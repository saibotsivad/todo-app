/**
 * Given an iterable object, like `Headers`, it'll take that and
 * map it to a key/value store, where the value is the singular
 * or an array containing all values if there are multiple.
 *
 * @param {Object} pairs - The iterable object.
 * @returns {Object} - The flattened iterable.
 */
export default pairs => {
	const map = {}
	for (const [ key, value ] of pairs) {
		if (Array.isArray(map[key])) {
			map[key].push(value)
		} else if (map[key] !== undefined) {
			map[key] = [ map[key], value ]
		} else {
			map[key] = value
		}
	}
	return map
}
