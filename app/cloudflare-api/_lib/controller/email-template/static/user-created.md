---
parameters:
  baseUrl:
    type: string
    description: The fully qualified URL to the main website.
  user:
    type: object
    description: The `user` object that was just created, e.g. `{ id, type, attributes }`.
  emailId:
    type: string
    description: The identifier of this email, used for API lookups.
  requestId:
    type: string
    description: The request identifier that initiated this password reset.
---

Hey there, looks like you just created an account at [Todo Journal]({{baseUrl}}).

I'm glad to have you here! If you have any questions, go ahead and email me directly, this
address goes to my direct inbox.

Welcome to the journaling experience!

–Tobias, for the [todojournal.com]({{baseUrl}}) crew


<script type="application/ld+json">
{
  "@context": "http://schema.org",
  "@type": "Thing",
  "name": "User Created",
  "identifier": "{{emailId}}",
  "url": "{{baseUrl}}/api/v1/sentEmails/{{emailId}}?requestId={{requestId}}"
}
</script>
