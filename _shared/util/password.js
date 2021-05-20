/**
 * Simply returns true if the given password is reasonable enough.
 * @param {String} password - The supplied password.
 * @returns {boolean} - True if the password is reasonable-ish.
 */
export const passwordIsReasonable = password => password.length > 10
	&& /[a-z]/.test(password)
	&& /[0-9]/.test(password)
