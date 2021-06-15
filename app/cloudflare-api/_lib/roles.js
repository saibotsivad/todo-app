export const readAllSentEmails = {
	urn: 'sentEmail:read:*',
	description: `
		The requesting user is able to read all emails sent by
		the API.
	`,
}

export const readSelfUser = {
	urn: 'user:read:{{currentUserId}}',
	description: `
		The requesting user is able to view their own user object.
	`,
}
