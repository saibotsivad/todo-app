import snarkdown from 'snarkdown'
import templite from 'templite'

export default (emailTemplate, parameters) => {
	return snarkdown(templite(emailTemplate.attributes.view, parameters))
}
