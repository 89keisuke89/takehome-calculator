#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WP_CONTENT_DIR="${ROOT_DIR}/wordpress-local/wp-content"
SHARED_DIR="${ROOT_DIR}/wordpress-local/shared"
PORT="${WORDPRESS_PORT:-9400}"
SITE_URL="${WORDPRESS_URL:-http://127.0.0.1:${PORT}}"

mkdir -p "${WP_CONTENT_DIR}/mu-plugins" "${SHARED_DIR}"

exec npx @wp-playground/cli@latest server \
  --port="${PORT}" \
  --site-url="${SITE_URL}" \
  --php=8.3 \
  --mount="${WP_CONTENT_DIR}:/wordpress/wp-content" \
  --mount="${SHARED_DIR}:/tmp/finance-shared" \
  --verbosity=normal
