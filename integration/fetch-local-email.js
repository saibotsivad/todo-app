import { join } from 'path'
import fs from 'fs/promises'

const getEmails = async () => {
	const files = await fs.readdir(process.env.LOCAL_SES_FOLDER)
	return Promise.all(files.map(filename => fs
		.readFile(join(process.env.LOCAL_SES_FOLDER, filename), 'utf8')
		.then(text => ({ text, json: JSON.parse(text) })),
	))
}

/*
This is an example SES message structure:

	{
	  "Destination": {
		"ToAddresses": [
		  "testuser+local@todojournal.com"
		]
	  },
	  "ReplyToAddresses": [
		"admin+local@localhost"
	  ],
	  "Source": "admin+local@localhost",
	  "Message": {
		"Subject": {
		  "Charset": "UTF-8",
		  "Data": "Welcome to the $SITE_NAME 🎉"
		},
		"Body": {
		  "Text": {
			"Charset": "UTF-8",
			"Data": "\nHey there, looks like you just created an account at [$SITE_NAME](http://localhost:3000).\n\nI'm glad to have you here! If you have any questions, go ahead and email me directly, this\naddress goes to my direct inbox.\n\nWelcome to the journaling experience!\n\n–Tobias, for the [todojournal.com](http://localhost:3000) crew\n\n<!-- requestId=DT26dmhXJeVUoWUZUmehIPTTyMY -->\n"
		  },
		  "Html": {
			"Charset": "UTF-8",
			"Data": "Hey there, looks like you just created an account at <a href=\"http://localhost:3000\">$SITE_NAME</a>.<br />I'm glad to have you here! If you have any questions, go ahead and email me directly, this\naddress goes to my direct inbox.<br />Welcome to the journaling experience!<br />–Tobias, for the <a href=\"http://localhost:3000\">todojournal.com</a> crew<br /><!-- requestId=DT26dmhXJeVUoWUZUmehIPTTyMY -->"
		  }
		}
	  }
	}

 */

/*
This is a very rudimentary synthesis of a JMAP email object from an SES one. It only
just barely works for the integration tests, but it's good enough.
*/
const synthesizeJmapEmail = obj => ({
	subject: obj.Message.Subject.Data,
	_html: obj.Message.Body.Html.Data,
})

/*
In order to make fully-local tests run, we write emails to disk
as JSON files. Here, we do a very inefficient lookup, by iterating
over every JSON file and looking for the request identifier in
the raw JSON text.

This is not optimized at all, but for the purposes of offline
integration tests, it's "good enough".
 */
export const fetchLocalEmail = async ({ requestId }) => {
	for (const { text, json } of await getEmails()) {
		if (text.includes(requestId)) {
			return synthesizeJmapEmail(json)
		}
	}
	console.log('Could not locate email by request id.', requestId)
	process.exit(1)
}
