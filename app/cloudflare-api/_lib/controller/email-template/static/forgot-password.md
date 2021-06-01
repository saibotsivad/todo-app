---
parameters:
  baseUrl:
    type: string
    required: true
    description: The fully qualified URL to the main website.
  tokenUrl:
    type: string
    required: true
    description: The fully qualified link to the password reset page.
  requestId:
    type: string
    required: true
    description: The request identifier that initiated this password reset.
---

Hey there, it looks like you forgot your password? Happens to
the best of us, no worries!

If that was you, [click this link]({{tokenUrl}}) to finish resetting
your password.

If it wasn't you, just ignore this email, we won't change a thing!

Keep on journaling,

–Tobias, for the [todojournal.com]({{baseUrl}}) crew

<!-- requestId={{requestId}} -->
