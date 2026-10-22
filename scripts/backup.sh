#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
umask 077
mkdir -p .local
docker exec sijani-postgres pg_dump -U sijani -d sijani --no-owner --no-acl > .local/database.sql.tmp
test -s .local/database.sql.tmp
mv .local/database.sql.tmp .local/database.sql
echo 'Saved local database snapshot under .local (ignored by Git).'
