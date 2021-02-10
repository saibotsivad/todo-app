import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { readFileSync, writeFileSync } from 'fs'
import routes from './server/globbed-routes.js'

const pathToRepo = dirname(fileURLToPath(import.meta.url))
const swaggerHtmlPath = join(pathToRepo, 'public/docs/index.html')
const swaggerJsonPath = join(pathToRepo, 'public/docs/swagger.json')
const { name: title, version } = JSON.parse(readFileSync(join(pathToRepo, 'package.json')))

const clean = string => string && string
	.replace(/\t/g, '')
	.split('\n')
	.map(line => line.trim())
	.join(' ')
	.trim()

const openapi = {
		swagger: '2.0',
		info: {
				version,
				title
		},
		tags: [
				// {
				//     name: 'some-tag',
				//     description: 'description'
				// }
		],
		paths: {
		// '/example/path': {
	//           post: {
	//               summary: 'short',
	//               description: 'long',
	//               tags: [ 'some-tag' ],
	//               parameters: [{
	//                   in: 'body',
	//                   name: 'body',
	//                   description: 'long',
	//                   required: true,
	//                   schema: {
	//                       $ref: '#/definitions/NameOfProperty'
	//                   }
	//               }],
	//               responses: {
	//                   200: {
	//                       description: 'OK'
	//                   },
	//                   401: {
	//                       description: 'The request is being made with a token that is not authorized.'
	//                   }
	//               },
	//               security: [
	//               	{ name: [ 'scope' ] }
	//               ]
	//           }
	//       }
		}
}

routes.forEach(({ path: routePath, export: route }) => {
	let path = (
		routePath
			.replace(/^route\//, '')
			.replace(/\.route\.js$/, '')
			.replace(/\[([^\]]+)\]/g, ':$1')
	).split('/')
	const method = path.pop().toLowerCase()
	path = '/' + path.join('/')

	openapi.paths[path] = openapi.paths[path] || {}
	openapi.paths[path][method] = {
		summary: clean(route.summary),
		description: clean(route.description),
		tags: route.tags,
		parameters: route.parameters, // probably a transform required
		responses: route.responses && Object
			.keys(route.responses)
			.reduce((map, key) => {
				map[key] = route.responses[key]
				if (route.responses[key].description) {
					route.responses[key].description = clean(route.responses[key].description)
				}
				return map
			}, {}),
		security: route.security && route.security.map(({ type, scopes }) => ({
			[type]: scopes
		}))
	}
})

// https://petstore.swagger.io/v2/swagger.json
const html = readFileSync(swaggerHtmlPath, 'utf8')
writeFileSync(
	swaggerHtmlPath,
	html.replace('https://petstore.swagger.io/v2/swagger.json', './swagger.json'),
	'utf8'
)

writeFileSync(swaggerJsonPath, JSON.stringify(openapi, undefined, 2), 'utf8')
