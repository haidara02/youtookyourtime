#!/usr/bin/env bash
# Copies the production database into the local MongoDB (pnpm db:start first).
#
# Read-only on prod (mongodump). The target is hard-wired to localhost and
# the local `youtookyourtime` db is replaced (--drop), so local edits are lost.
# Reads PROD_DATABASE_URL from .env.local (or the environment).
#
#   pnpm db:pull
set -euo pipefail
cd "$(dirname "$0")/.."

DB_NAME="youtookyourtime"
LOCAL_URI="mongodb://127.0.0.1:27017"

PROD_URL="${PROD_DATABASE_URL:-}"
if [[ -z "$PROD_URL" && -f .env.local ]]; then
  # Parsed rather than `source`d: the URL contains `&`, which a shell would
  # treat as "run in background".
  PROD_URL="$(grep -E '^PROD_DATABASE_URL=' .env.local | head -1 | cut -d= -f2- | sed -e 's/^["'\'']//' -e 's/["'\'']$//')"
fi
if [[ -z "$PROD_URL" ]]; then
  echo "PROD_DATABASE_URL is not set (in .env.local or the environment)." >&2
  exit 1
fi

if ! mongosh --quiet "$LOCAL_URI" --eval 'db.runCommand({ ping: 1 }).ok' >/dev/null 2>&1; then
  echo "Local MongoDB isn't running on $LOCAL_URI — run: pnpm db:start" >&2
  exit 1
fi

echo "Copying prod '$DB_NAME' -> local $LOCAL_URI/$DB_NAME (replacing local data)…"
mongodump --uri="$PROD_URL" --db="$DB_NAME" --archive --quiet \
  | mongorestore --uri="$LOCAL_URI" --archive --drop --quiet \
      --nsInclude="$DB_NAME.*"

echo "Done. Collections now in local $DB_NAME:"
mongosh --quiet "$LOCAL_URI/$DB_NAME" --eval \
  'db.getCollectionNames().sort().forEach(n => print(`  ${n}: ${db.getCollection(n).estimatedDocumentCount()}`))'
