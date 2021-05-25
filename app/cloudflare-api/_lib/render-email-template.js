export default (emailTemplate, parameters) => {
	// TODO render the markdown
	return emailTemplate + JSON.stringify(parameters)
}
