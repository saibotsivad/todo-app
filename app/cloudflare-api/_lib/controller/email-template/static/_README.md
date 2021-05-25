# Email Templates

These template files are stored in and accessed from DynamoDB, so that they can be
dynamically updated without an API deploy.

On each deploy, a script checks that the markdown files in the `./static` folder are
each in DynamoDB, and if they aren't they are created.

If the record exists, the `parameters` are updated to whatever is in the markdown frontmatter.

Each template file has the parameters passed into it defined in the frontmatter, such
that a person updating the template dynamically can see what parameters they will be
given.

If you update the code site of a template, you will need to update the markdown files.

**If changes are not backwards compatible, you will need to create a database migration.**
