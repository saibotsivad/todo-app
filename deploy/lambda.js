require('source-map-support').install()

const server = require('./build.js')

module.exports.handler = server()
