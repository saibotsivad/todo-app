require('source-map-support').install()

const server = require('./build/lambda.js')

module.exports.handler = server()
