import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { readFileSync, writeFileSync } from 'fs'
import routes from './app/cloudflare-api/globbed-routes.js'
import * as tags from './app/cloudflare-api/_lib/tags.js'

const pathToRepo = dirname(fileURLToPath(import.meta.url))
const swaggerHtmlPath = join(pathToRepo, 'deploy/cloudflare-static/public/docs/index.html')
const swaggerJsonPath = join(pathToRepo, 'deploy/cloudflare-static/public/docs/swagger.json')
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

const openapi = {
	swagger: '2.0',
	info: {
		version,
		title,
		description: readFileSync('./openapi-description.md', 'utf8')
	},
	tags: Object
		.keys(tags)
		.map(name => ({
			name,
			description: clean(tags[name])
		})),
	paths: {}
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
		security: route.security && route.security.map(({ type, scopes }) => ({
			[type]: scopes
		}))
	}
})

// https://petstore.swagger.io/v2/swagger.json
const html = readFileSync(swaggerHtmlPath, 'utf8')
writeFileSync(
	swaggerHtmlPath,
	html
		.replace('https://petstore.swagger.io/v2/swagger.json', './swagger.json')
		.replace('<title>Swagger UI</title>', `<title>Todo App API</title>`),
	'utf8'
)

writeFileSync(swaggerJsonPath, JSON.stringify(openapi, undefined, 2), 'utf8')
