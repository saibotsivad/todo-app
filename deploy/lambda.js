const server = require('./build.js')

module.exports.handler = async (event, context) => {
	return server({ event, context })
}
