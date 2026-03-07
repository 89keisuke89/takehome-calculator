#!/usr/bin/env bash
set -euo pipefail

SITE_URL="${1:-${SEARCH_CONSOLE_SITE_URL:-https://takehome-calculator.pages.dev/}}"
DEFAULT_SITEMAP_URL="${SITE_URL%/}/sitemap.xml"
SITEMAP_URL="${2:-${SEARCH_CONSOLE_SITEMAP_URL:-$DEFAULT_SITEMAP_URL}}"
ACCESS_TOKEN="${GOOGLE_WEBMASTERS_ACCESS_TOKEN:-}"

if [[ -z "$ACCESS_TOKEN" ]]; then
  echo "Missing GOOGLE_WEBMASTERS_ACCESS_TOKEN" >&2
  echo "Required OAuth scope: https://www.googleapis.com/auth/webmasters" >&2
  exit 1
fi

ENCODED_SITE_URL="$(node -p 'encodeURIComponent(process.argv[1])' "$SITE_URL")"
ENCODED_SITEMAP_URL="$(node -p 'encodeURIComponent(process.argv[1])' "$SITEMAP_URL")"

curl -fsS \
  -X PUT \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  "https://www.googleapis.com/webmasters/v3/sites/${ENCODED_SITE_URL}/sitemaps/${ENCODED_SITEMAP_URL}"

echo "Submitted sitemap: ${SITEMAP_URL}"
echo "Property: ${SITE_URL}"
