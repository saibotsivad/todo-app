#!/usr/bin/env bash

# These are environment variables that you'll need to set to run
# the project locally. When deployed using the `serverless` cli
# commands, all variables are configured auto-magically.

# AWS credentials
export AWS_ACCOUNT_ID="123456789012"
export AWS_REGION="us-east-1"
export AWS_ACCESS_KEY_ID="AKIAEXAMPLEKEY"
export AWS_SECRET_ACCESS_KEY="abc123abc123abc123abc123"

# Cloudflare credentials
export CF_ACCOUNT_ID="12345"
export CF_API_TOKEN="veryLongAPIToken"

# Log level. See discussion in the `server/service/log.js` for the
# different levels of logging. By default only `info` level and higher
# are printed, but when run locally it's usually helpful to see one
# level more in detail.
export LOG_LEVEL="debug"

# Ideally when run locally this would be like "branch-name-123"
# but for now it's just the develop stage
export STAGE="local"
export NODE_ENV="$STAGE"

# =========================================================
# The following are application specific, which is why they
# use the `TJ_` (aka todojournal) prefix.

# The name of the DynamoDB table that stores all the data.
export DYNAMODB_TABLE_NAME="todojournal-$STAGE"

# The email address used to send out password reset and user
# confirmation emails.
export ADMIN_EMAIL_ADDRESS="admin+$STAGE@todojournal.com"

# The domain where the app is run, e.g. `todojournal.com` or
# a sub-domain during testing, e.g. `testing.todojournal.com`
# or locally `localhost:3000`
export API_DOMAIN="todojournal.com"

# To run the integration tests, you either need to set the base
# url, or (if running locally) the port.
export BASE_URL="http://localhost:3000"
export PORT="3000"

# To run fully locally, with DynamoDB-local running in a Docker
# container, you will need to set this URL. When it is set, running
# `npm run dev` will wait for the Docker container to be live, by
# trying to make a request to DynamoDB-local until it responds.
export DYNAMODB_URL="http://localhost:3001"

# To run the integration test involving sending and receiving
# email, you will need to set these properties.
export JMAP_USERNAME="user@site.com"
export JMAP_PASSWORD="abc123abc123abc123abc123"
export JMAP_HOSTNAME="betajmap.fastmail.com"
