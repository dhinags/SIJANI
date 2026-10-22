#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [ ! -f .env ]; then cp .env.example .env; fi
npm ci
npm run db:generate
npm run db:start
npm run db:migrate
npm run db:seed
echo 'Local demo prepared. Run npm run dev.'
