import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { readFileSync, writeFileSync } from 'fs'
import globbedRoutes from './app/cloudflare-api/globbed-routes.js'
import globbedSecurity from './app/cloudflare-api/globbed-security.js'
import * as tags from './app/cloudflare-api/_lib/tags.js'
import * as roles from './app/cloudflare-api/_lib/roles.js'

const pathToRepo = dirname(fileURLToPath(import.meta.url))
const swaggerHtmlPath = join(pathToRepo, 'deploy/cloudflare-static/public/docs/index.html')
const swaggerJsonPath = join(pathToRepo, 'deploy/cloudflare-static/public/docs/openapi.json')
const { name: title, version } = JSON.parse(readFileSync(join(pathToRepo, 'package.json'), 'utf8'))

const clean = string => string && string
	.replace(/\t/g, '')
	.split('\n')
	.map(line => line.trim())
	.join(' ')
	.trim()

// Note: this counts on tag descriptions being unique.
const tagDescriptionToKey = Object
	.keys(tags)
	.reduce((map, name) => {
		map[tags[name]] = name
		return map
	}, {})

// Note: this counts on role URNs being unique.
const allPossibleRoles = Object
	.keys(roles)
	.reduce((map, key) => {
		map[roles[key].urn] = roles[key].description
		return map
	}, {})

const openapi = {
	swagger: '2.0',
	info: {
		version,
		title,
		description: readFileSync('./openapi-description.md', 'utf8'),
	},
	tags: Object
		.keys(tags)
		.map(name => ({
			name,
			description: clean(tags[name]),
		})),
	paths: {},
	securityDefinitions: globbedSecurity.reduce((map, foo) => {
		const { name, definition } = foo.export
		// Note: this counts on the security names being unique.
		map[name] = definition
		// Note: in OpenAPI 3, the naming of this changes
		map[name].scopes = allPossibleRoles
		return map
	}, {}),
}

globbedRoutes.forEach(({ path: routePath, export: route }) => {
	let path = (
		routePath
			.replace(/^route\//, '')
			.replace(/\.route\.js$/, '')
			.replace(/\[([^\]]+)]/g, ':$1')
	).split('/')
	const method = path.pop().toLowerCase()
	path = '/' + path.join('/')

	if (!path.startsWith('/api/')) return

	openapi.paths[path] = openapi.paths[path] || {}
	openapi.paths[path][method] = {
		summary: clean(route.summary),
		description: clean(route.description),
		tags: route.tags.map(description => tagDescriptionToKey[description]),
		parameters: route.parameters, // probably a transform required?
		responses: route.responses && Object
			.keys(route.responses)
			.reduce((map, key) => {
				map[key] = route.responses[key]
				if (route.responses[key].description) {
					route.responses[key].description = clean(route.responses[key].description)
				}
				return map
			}, {}),
		security: route.security && route.security.map(block => {
			return Object.keys(block).reduce((map, blockName) => {
				map[blockName] = (block[blockName].roles || []).map(({ urn }) => urn)
				return map
			}, {})
		}),
	}
})

const html = readFileSync(swaggerHtmlPath, 'utf8')
writeFileSync(
	swaggerHtmlPath,
	html
		.replace('https://petstore.swagger.io/v2/swagger.json', './openapi.json')
		.replace('<title>Swagger UI</title>', `<title>Todo App API</title>`),
	'utf8',
)

writeFileSync(swaggerJsonPath, JSON.stringify(openapi, undefined, 2), 'utf8')
