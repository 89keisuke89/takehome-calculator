#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CREDENTIALS_FILE="${ROOT_DIR}/wordpress-local/shared/wordpress-credentials.json"

if [[ ! -f "${CREDENTIALS_FILE}" ]]; then
  echo "Credentials file not found: ${CREDENTIALS_FILE}" >&2
  echo "Start local WordPress first: ./scripts/start-local-wordpress.sh" >&2
  exit 1
fi

export WORDPRESS_CREDENTIALS_FILE="${CREDENTIALS_FILE}"
export RSS_FEED_URL="${RSS_FEED_URL:-https://www.cnbc.com/id/19746125/device/rss/rss.html}"
export MAX_ARTICLES="${MAX_ARTICLES:-3}"

exec python3 "${ROOT_DIR}/auto_fin_blog.py"
