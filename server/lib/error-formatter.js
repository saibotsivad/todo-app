export default error => {
	error = error || {}
	console.error(error)
	return {
		status: error.status && error.status.toString() || '500',
		code: (error.name !== 'Error' && error.name) || error.code || 'UnexpectedException',
		title: error.title || 'Unexpected server exception',
		detail: error.message || error.detail || 'Unexpected server exception, please report to API maintainers.',
		meta: error.meta
	}
}