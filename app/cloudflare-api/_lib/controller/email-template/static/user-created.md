---
parameters:
  baseUrl:
    type: string
    description: The fully qualified URL to the main website.
  requestId:
    type: string
    description: The request identifier that initiated this password reset.
  user:
    type: object
    description: The `user` object that was just created, e.g. `{ id, type, attributes }`.
---

Hey there, looks like you just created an account at [Todo Journal]({{baseUrl}}).

I'm glad to have you here! If you have any questions, go ahead and email me directly, this
address goes to my direct inbox.

Welcome to the journaling experience!

–Tobias, for the [todojournal.com]({{baseUrl}}) crew

<!-- requestId={{requestId}} -->
