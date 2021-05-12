export const generateIndex = prefix => `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width,initial-scale=1">
	<meta http-equiv="content-type" content="text/html; charset=utf-8" />

	<title>todo app</title>

	<link rel="icon" type="image/png" href="${prefix}asset/favicon.png">
	<link rel="stylesheet" href="${prefix}asset/global.css">
	<link rel="stylesheet" href="${prefix}build/bundle.css">

	<script defer type="module" src="${prefix}build/main.js"></script>
</head>

<body>
</body>
</html>
`
