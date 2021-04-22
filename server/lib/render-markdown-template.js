import log from 'service/log.js'

export default ({ parameters, template }) => {
	log.debug('rendering markdown template', { parameters, template })
	// TODO render the markdown
	// if the template has frontmatter with `parameters`
	// make sure those are set
}
