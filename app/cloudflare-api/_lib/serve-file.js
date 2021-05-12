import fs from 'fs/promises'
import errorFormatter from '@/lib/error-formatter.js'
import { extname } from 'path'
import mime from 'mime'

export const serveFile = async ({ filepath }) => {
	try {
		const file = await fs.readFile(filepath, 'utf8')
		return {
			status: 200,
			body: file,
			headers: {
				'content-type': mime.getType(extname(filepath).replace(/^\./, '')),
				'content-length': Buffer.byteLength(file)
			}
		}
	} catch (error) {
		return {
			status: 404,
			body: {
				errors: [ errorFormatter(error) ]
			}
		}
	}
}
