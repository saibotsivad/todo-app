// copied from https://raw.githubusercontent.com/lukeed/polka/next/packages/polka/index.js
// available under the MIT license

import Router from 'trouter'

// copied from nodejs core
const STATUS_CODES = {
	100: 'Continue',                   // RFC 7231 6.2.1
	101: 'Switching Protocols',        // RFC 7231 6.2.2
	102: 'Processing',                 // RFC 2518 10.1 (obsoleted by RFC 4918)
	103: 'Early Hints',                // RFC 8297 2
	200: 'OK',                         // RFC 7231 6.3.1
	201: 'Created',                    // RFC 7231 6.3.2
	202: 'Accepted',                   // RFC 7231 6.3.3
	203: 'Non-Authoritative Information', // RFC 7231 6.3.4
	204: 'No Content',                 // RFC 7231 6.3.5
	205: 'Reset Content',              // RFC 7231 6.3.6
	206: 'Partial Content',            // RFC 7233 4.1
	207: 'Multi-Status',               // RFC 4918 11.1
	208: 'Already Reported',           // RFC 5842 7.1
	226: 'IM Used',                    // RFC 3229 10.4.1
	300: 'Multiple Choices',           // RFC 7231 6.4.1
	301: 'Moved Permanently',          // RFC 7231 6.4.2
	302: 'Found',                      // RFC 7231 6.4.3
	303: 'See Other',                  // RFC 7231 6.4.4
	304: 'Not Modified',               // RFC 7232 4.1
	305: 'Use Proxy',                  // RFC 7231 6.4.5
	307: 'Temporary Redirect',         // RFC 7231 6.4.7
	308: 'Permanent Redirect',         // RFC 7238 3
	400: 'Bad Request',                // RFC 7231 6.5.1
	401: 'Unauthorized',               // RFC 7235 3.1
	402: 'Payment Required',           // RFC 7231 6.5.2
	403: 'Forbidden',                  // RFC 7231 6.5.3
	404: 'Not Found',                  // RFC 7231 6.5.4
	405: 'Method Not Allowed',         // RFC 7231 6.5.5
	406: 'Not Acceptable',             // RFC 7231 6.5.6
	407: 'Proxy Authentication Required', // RFC 7235 3.2
	408: 'Request Timeout',            // RFC 7231 6.5.7
	409: 'Conflict',                   // RFC 7231 6.5.8
	410: 'Gone',                       // RFC 7231 6.5.9
	411: 'Length Required',            // RFC 7231 6.5.10
	412: 'Precondition Failed',        // RFC 7232 4.2
	413: 'Payload Too Large',          // RFC 7231 6.5.11
	414: 'URI Too Long',               // RFC 7231 6.5.12
	415: 'Unsupported Media Type',     // RFC 7231 6.5.13
	416: 'Range Not Satisfiable',      // RFC 7233 4.4
	417: 'Expectation Failed',         // RFC 7231 6.5.14
	418: 'I\'m a Teapot',              // RFC 7168 2.3.3
	421: 'Misdirected Request',        // RFC 7540 9.1.2
	422: 'Unprocessable Entity',       // RFC 4918 11.2
	423: 'Locked',                     // RFC 4918 11.3
	424: 'Failed Dependency',          // RFC 4918 11.4
	425: 'Too Early',                  // RFC 8470 5.2
	426: 'Upgrade Required',           // RFC 2817 and RFC 7231 6.5.15
	428: 'Precondition Required',      // RFC 6585 3
	429: 'Too Many Requests',          // RFC 6585 4
	431: 'Request Header Fields Too Large', // RFC 6585 5
	451: 'Unavailable For Legal Reasons', // RFC 7725 3
	500: 'Internal Server Error',      // RFC 7231 6.6.1
	501: 'Not Implemented',            // RFC 7231 6.6.2
	502: 'Bad Gateway',                // RFC 7231 6.6.3
	503: 'Service Unavailable',        // RFC 7231 6.6.4
	504: 'Gateway Timeout',            // RFC 7231 6.6.5
	505: 'HTTP Version Not Supported', // RFC 7231 6.6.6
	506: 'Variant Also Negotiates',    // RFC 2295 8.1
	507: 'Insufficient Storage',       // RFC 4918 11.5
	508: 'Loop Detected',              // RFC 5842 7.2
	509: 'Bandwidth Limit Exceeded',
	510: 'Not Extended',               // RFC 2774 7
	511: 'Network Authentication Required', // RFC 6585 6
}

function onError(err, req, res) {
	let code = (res.statusCode = err.code || err.status || 500)
	if (typeof err === 'string' || Buffer.isBuffer(err)) res.end(err)
	else res.end(err.message || STATUS_CODES[code])
}

const parser = req => {
	return req.url === null
		? undefined
		: new URL(req.url)
}

const mount = fn => fn instanceof Polka ? fn.attach : fn

class Polka extends Router {
	constructor(opts={}) {
		super()
		this.parse = parser
		this.server = opts.server
		this.handler = this.handler.bind(this)
		this.onError = opts.onError || onError // catch-all handler
		this.onNoMatch = opts.onNoMatch || this.onError.bind(null, { code: 404 })
		this.attach = (req, res) => setImmediate(this.handler, req, res)
	}

	use(base, ...fns) {
		if (base === '/') {
			super.use(base, fns.map(mount))
		} else if (typeof base === 'function' || base instanceof Polka) {
			super.use('/', [ base, ...fns ].map(mount))
		} else {
			super.use(base,
				(req, _, next) => {
					if (typeof base === 'string') {
						let len = base.length
						base.startsWith('/') || len++
						req.url = req.url.substring(len) || '/'
						req.path = req.path.substring(len) || '/'
					} else {
						req.url = req.url.replace(base, '') || '/'
						req.path = req.path.replace(base, '') || '/'
					}
					if (req.url.charAt(0) !== '/') {
						req.url = '/' + req.url
					}
					next()
				},
				fns.map(mount),
				(req, _, next) => {
					req.url = req._parsedUrl.href
					req.path = req._parsedUrl.pathname
					next()
				},
			)
		}
		return this // chainable
	}
	//
	// listen() {
	// 	(this.server = this.server || http.createServer()).on('request', this.attach)
	// 	this.server.listen.apply(this.server, arguments)
	// 	return this
	// }

	handler(req, res, next) {
		let { pathname, query, search } = this.parse(req, true)
		let obj = this.find(req.method, req.path = pathname)

		req.params = obj.params
		req.originalUrl = req.originalUrl || req.url
		req.query = query || {}
		req.search = search

		try {
			let i=0, arr=obj.handlers.concat(this.onNoMatch), len=arr.length
			let loop = () => res.finished || (i < len) && arr[i++](req, res, next)
			next = next || (err => err ? this.onError(err, req, res, next) : loop())
			loop() // init
		} catch (err) {
			this.onError(err, req, res, next)
		}
	}
}

export default function (opts) {
	return new Polka(opts)
}
