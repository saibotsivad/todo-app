# Todo Journal

This is the base API for the todo-journal project, which is an opinionated
test bed wherein [the author](https://davistobias.com) smashes together
random lessons learned into the todo app of his dreams.

## Authentication

Normal email+password login.

The only thing I've wondered is if it'd be better to have `session`
endpoints, e.g.

- `POST /api/v1/auth/session` would be the email+password login flow
	that would also set a cookie
- `PATCH /api/v1/auth/session` would let you expire the session, which
	would set the cookie as expired

But anyway, I'll get around to session management endpoints soon enough,
I would guess.

---
