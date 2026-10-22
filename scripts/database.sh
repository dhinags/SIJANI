#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
name=sijani-postgres
fresh=false
if docker container inspect "$name" >/dev/null 2>&1; then
  docker start "$name" >/dev/null
else
  if ! docker volume inspect sijani-postgres-data >/dev/null 2>&1; then fresh=true; fi
  docker run -d --name "$name" -e POSTGRES_USER=sijani -e POSTGRES_DB=sijani \
    -e POSTGRES_HOST_AUTH_METHOD=trust -p 127.0.0.1:54329:5432 \
    -v sijani-postgres-data:/var/lib/postgresql/data \
    postgres:17-bookworm@sha256:3645570cccdfa447589da9f57dd740faa29b30938e861289a5574b6ca6b03826 >/dev/null
fi
for attempt in $(seq 1 30); do
  if docker exec "$name" pg_isready -U sijani -d sijani >/dev/null 2>&1; then
    if [ "$fresh" = true ] && [ -s .local/database.sql ]; then
      docker exec -i "$name" psql -v ON_ERROR_STOP=1 -U sijani -d sijani < .local/database.sql >/dev/null
      echo 'Restored retained local database snapshot into a fresh volume.'
    fi
    echo 'PostgreSQL ready on loopback port 54329.'
    exit 0
  fi
  sleep 1
done
echo 'Database startup failed. Inspect docker logs sijani-postgres.' >&2
exit 1
