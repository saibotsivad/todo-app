export const summary = `
	Fetch main SPA HTML page.
`

export const description = `
	Return the HTML of the core SPA, which is the \`index.html\`
	containing the injected scripts and etc.
`

export const responses = {
	200: {
		description: `
			The HTML.
		`
	}
}

export const html = `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width,initial-scale=1">

	<title>todo app</title>

	<link rel="icon" type="image/png" href="./asset/favicon.png">
	<link rel="stylesheet" href="./asset/global.css">
	<link rel="stylesheet" href="./build/bundle.css">

	<script defer type="module" src="./build/main.js"></script>
</head>

<body>
</body>
</html>
`

export const handler = async () => ({
	body: html,
	status: 200,
	headers: {
		'content-type': 'text/html'
	}
})
