import { get } from '@/service/process-env.node.js'

export default error => {
	error = error || {}

	if (get('NODE_ENV') === 'production') {
		if (error.meta) {
			delete error.meta.stacktrace
		}
	} else {
		error.meta = error.meta || {}
		error.meta.stacktrace = error.meta && error.meta.stacktrace || error.stack
	}

	return {
		status: error.status && error.status.toString() || '500',
		code: (error.constructor.name !== 'Error' && error.constructor.name) || error.code || 'UnexpectedException',
		title: error.title || 'Unexpected server exception',
		detail: error.message || error.detail || 'Unexpected server exception, please report to API maintainers.',
		meta: error.meta
	}
}
