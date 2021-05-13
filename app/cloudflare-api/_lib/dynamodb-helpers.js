export const itemAlreadyExists = response => response
	&& response.CancellationReasons
	&& response.CancellationReasons.find(({ Code }) => Code === 'ConditionalCheckFailed')
	|| (
		response
		&& response.__type
		&& response.__type.includes('ConditionalCheckFailedException')
	)
