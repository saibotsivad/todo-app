import { get } from '@/service/variables.js'

export default error => {
	error = error || {}

	if (get('NODE_ENV') === 'production') {
		if (error.meta) {
			delete error.meta.stacktrace
		}
	} else if (error.meta && error.meta.stacktrace) {
		error.meta = error.meta || {}
		error.meta.stacktrace = error.meta && error.meta.stacktrace || error.stack
	}

	return {
		status: error.status && error.status.toString() || '500',
		code: (error.name !== 'Error' && error.name) || error.code || 'UnexpectedException',
		title: error.title || 'Unexpected server exception',
		detail: error.message || error.detail || 'Unexpected server exception, please report to API maintainers.',
		meta: error.meta
	}
}