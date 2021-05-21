# Manual Controller Tests

These files are here to make it easier to manually develop
and maintain the controllers. Once they are worked out, there
should be full integration test coverage, and these tests
can actually be removed.

Run them manually, e.g.:

```bash
node ./app/cloudflare-api/_lib/controller/_tests/users.js
```

If you want to blow away all data from a local DynamoDB
instance, you can just delete the `.db` file and then
re-initialize:

```bash
rm ./deploy/docker-dynamodb/docker/dynamodb/*.db
npm run dynamodb
node ./initialize-local-dynamodb.js
```
