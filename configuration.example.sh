#!/usr/bin/env bash

# Normal AWS credentials.
export AWS_ACCOUNT_ID="123456789012"
export AWS_REGION="us-east-1"
export AWS_ACCESS_KEY_ID="AKIAEXAMPLEKEY"
export AWS_SECRET_ACCESS_KEY="abc123abc123abc123abc123"

# TODO: ideally when run locally this would be like "branch-name-123"
# but for now it's just the develop stage
export STAGE="dev"

# The name of the DynamoDB table that stores all the data.
export TABLE_NAME="todo-app-$STAGE"

# The email address used to send out password reset and user
# confirmation emails.
export ADMIN_EMAIL_ADDRESS="admin+$STAGE@todo-app.com"
