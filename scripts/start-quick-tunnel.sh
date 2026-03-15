#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BIN_DIR="${ROOT_DIR}/.local-bin"
CLOUDFLARED="${BIN_DIR}/cloudflared"
PORT="${WORDPRESS_PORT:-9400}"
TARGET_URL="${PUBLIC_TUNNEL_TARGET_URL:-http://127.0.0.1:${PORT}}"
DOWNLOAD_URL="https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-arm64.tgz"

mkdir -p "${BIN_DIR}"

if [[ ! -x "${CLOUDFLARED}" ]]; then
  TMP_DIR="$(mktemp -d)"
  trap 'rm -rf "${TMP_DIR}"' EXIT
  curl -L "${DOWNLOAD_URL}" -o "${TMP_DIR}/cloudflared.tgz"
  tar -xzf "${TMP_DIR}/cloudflared.tgz" -C "${TMP_DIR}"
  mv "${TMP_DIR}/cloudflared" "${CLOUDFLARED}"
  chmod +x "${CLOUDFLARED}"
fi

exec "${CLOUDFLARED}" tunnel --url "${TARGET_URL}" --no-autoupdate
