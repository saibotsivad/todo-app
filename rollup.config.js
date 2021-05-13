/* eslint-disable no-undef */
import svelte from 'rollup-plugin-svelte'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
import livereload from 'rollup-plugin-livereload'
import { terser } from 'rollup-plugin-terser'
import css from 'rollup-plugin-css-only'
import { string } from 'rollup-plugin-string'
import alias from '@rollup/plugin-alias'
import npmRun from 'rollup-plugin-npm-run'

const production = !process.env.ROLLUP_WATCH

function generateOpenApi() {
	return {
		writeBundle() {
			require('child_process').spawn('node', [ 'generate-openapi.js' ], {
				stdio: [ 'ignore', 'inherit', 'inherit' ],
				shell: true
			})
		}
	}
}

const client = {
	input: 'app/website/main.js',
	output: {
		sourcemap: true,
		format: 'iife',
		dir: 'deploy/cloudflare-static/public/build'
	},
	plugins: [
		svelte({
			compilerOptions: {
				// enable run-time checks when not in production
				dev: !production
			}
		}),
		// we'll extract any component CSS out into
		// a separate file - better for performance
		css({ output: 'bundle.css' }),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration -
		// consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs
		resolve({
			browser: true,
			dedupe: [ 'svelte' ]
		}),
		commonjs(),

		// Watch the `public` directory and refresh the
		// browser on changes when not in production
		!production && livereload('public'),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser()
	],
	watch: {
		clearScreen: false
	}
}

// const lambda = {
// 	input: production
// 		? 'app/cloudflare-api/legacy-lambda.js'
// 		: 'app/cloudflare-api/local-development.js',
// 	output: {
// 		sourcemap: true,
// 		format: 'cjs',
// 		exports: production
// 			? 'default'
// 			: undefined,
// 		dir: 'deploy/lambda-api/build'
// 	},
// 	plugins: [
// 		// If you have external dependencies installed from
// 		// npm, you'll most likely need these plugins. In
// 		// some cases you'll need additional configuration -
// 		// consult the documentation for details:
// 		// https://github.com/rollup/plugins/tree/master/packages/commonjs
// 		resolve({
// 			browser: false,
// 			preferBuiltins: true
// 		}),
// 		string({
// 			include: '**/*.md'
// 		}),
// 		commonjs(),
//
// 		json(),
//
// 		// In dev mode, call `npm run start` once
// 		// the API bundle has been generated
// 		!production && run(),
//
// 		// If we're building for production (npm run build
// 		// instead of npm run dev), minify
// 		production && terser()
// 	]
// }

const cloudflareApi = {
	input: 'app/cloudflare-api/worker-wrapped.js',
	output: {
		sourcemap: true,
		format: 'es',
		file: 'deploy/cloudflare-api/build/build.js',
		inlineDynamicImports: true
	},
	plugins: [
		production && alias({
			entries: [
				{ find: /^(.*)\.node\.js$/, replacement: '$1.worker.js' }
			]
		}),
		resolve({
			browser: true,
			preferBuiltins: false
		}),
		string({
			include: '**/*.md'
		}),
		commonjs(),
		json(),
		generateOpenApi(),
		// In dev mode, call `npm run start` once
		// the bundle has been generated
		!production && npmRun('start')
	],
	watch: {
		clearScreen: false
	}
}

const cloudflareStatic = {
	input: 'app/cloudflare-static/main.js',
	output: {
		format: 'es',
		file: 'deploy/cloudflare-static/worker/build/build.js',
		inlineDynamicImports: true
	},
	plugins: [
		resolve({
			browser: true
		}),
		commonjs()
	],
	watch: {
		clearScreen: false
	}
}

export default [
	client,
	// lambda,
	cloudflareApi,
	cloudflareStatic
]
