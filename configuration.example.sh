#!/usr/bin/env bash

# These are environment variables that you'll need to set to run
# the project locally. When deployed using the `serverless` cli
# commands, all variables are configured auto-magically.

# Normal AWS credentials.
export AWS_ACCOUNT_ID="123456789012"
export AWS_REGION="us-east-1"
export AWS_ACCESS_KEY_ID="AKIAEXAMPLEKEY"
export AWS_SECRET_ACCESS_KEY="abc123abc123abc123abc123"

# Log level. See discussion in the `server/service/log.js` for the
# different levels of logging. By default only `info` level and higher
# are printed, but when run locally it's usually helpful to see one
# level more in detail.
export LOG_LEVEL="debug"

# TODO: ideally when run locally this would be like "branch-name-123"
# but for now it's just the develop stage
export STAGE="dev"

# =========================================================
# The following are application specific, which is why they
# use the `TJ_` (aka todojournal) prefix.

# The name of the DynamoDB table that stores all the data.
export TJ_TABLE_NAME="todojournal-$STAGE"

# The email address used to send out password reset and user
# confirmation emails.
export TJ_ADMIN_EMAIL_ADDRESS="admin+$STAGE@todojournal.com"

# The domain where the app is run, e.g. `todojournal.com` or
# a sub-domain during testing, e.g. `testing.todojournal.com`
# or locally `localhost:3000`
export TJ_API_DOMAIN="todojournal.com"
