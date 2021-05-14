import { extname, join } from 'path'
import { NotFound } from '@/lib/exceptions.js'
import { catchify } from '@/shared/catchify.js'
import fs from 'fs/promises'
import errorFormatter from '@/lib/error-formatter.js'
import mime from 'mime'

export const serveFile = async ({ filepath }) => {
	filepath = filepath || ''
	filepath = filepath.endsWith('/')
		? join(filepath, 'index.html')
		: filepath
	console.log('----------------------', filepath)
	const [ error, file ] = await catchify(fs.readFile(filepath, 'utf8'))

	if (error && error.code === 'EISDIR') {
		return {
			status: 404,
			json: true,
			body: {
				errors: [ errorFormatter(new NotFound('Could not locate file', { filepath })) ],
			},
		}
	} else if (error) {
		return {
			status: 500,
			json: true,
			body: {
				errors: [ errorFormatter(error) ],
			},
		}
	}

	return {
		status: 200,
		body: file,
		headers: {
			'content-type': mime.getType(extname(filepath).replace(/^\./, '')),
			'content-length': Buffer.byteLength(file),
		},
	}
}
