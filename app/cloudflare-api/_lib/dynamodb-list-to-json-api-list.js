export default (dynamodbResponse) => {
	const response = JSON.parse(dynamodbResponse.body)
	return {
		data: response.Items.map(({ id, type, ...remaining }) => ({
			id: id.S,
			type: type.S,
			attributes: Object
				.entries(remaining)
				.filter(([ key ]) => key !== 'pk' && key !== 'sk')
				.reduce((map, [ key, value ]) => {
					map[key] = value[Object.keys(value)[0]]
					return map
				}, {}),
		})),
	}
}
