#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUT_ROOT="${ROOT_DIR}/domain-out"
ONLY_SLUG=""

while (($#)); do
  case "$1" in
    --only)
      ONLY_SLUG="${2:-}"
      shift 2
      ;;
    --out)
      OUT_ROOT="${2:-}"
      shift 2
      ;;
    *)
      echo "Unknown option: $1" >&2
      echo "Usage: $0 [--only <slug>] [--out <dir>]" >&2
      exit 1
      ;;
  esac
done

if ! command -v npm >/dev/null 2>&1; then
  if [[ -s "${HOME}/.nvm/nvm.sh" ]]; then
    # shellcheck disable=SC1090
    . "${HOME}/.nvm/nvm.sh"
  fi
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm command not found. Load Node.js/NVM first." >&2
  exit 1
fi

TARGETS=()
while IFS= read -r line; do
  TARGETS+=("${line}")
done < <(
  awk '
    /slug: "/ {
      slug = $0
      sub(/.*slug: "/, "", slug)
      sub(/".*/, "", slug)
    }
    /domain: "/ {
      domain = $0
      sub(/.*domain: "/, "", domain)
      sub(/".*/, "", domain)
      if (slug != "") {
        print slug "|" domain
        slug = ""
      }
    }
  ' "${ROOT_DIR}/lib/domain-products.ts"
)

if ((${#TARGETS[@]} == 0)); then
  echo "No domain targets found in lib/domain-products.ts" >&2
  exit 1
fi

if [[ -n "${ONLY_SLUG}" ]]; then
  FILTERED=()
  for item in "${TARGETS[@]}"; do
    slug="${item%%|*}"
    if [[ "${slug}" == "${ONLY_SLUG}" ]]; then
      FILTERED+=("${item}")
    fi
  done
  TARGETS=("${FILTERED[@]}")
fi

if ((${#TARGETS[@]} == 0)); then
  echo "No matching target for slug: ${ONLY_SLUG}" >&2
  exit 1
fi

mkdir -p "${OUT_ROOT}"
total="${#TARGETS[@]}"
index=0

for item in "${TARGETS[@]}"; do
  index=$((index + 1))
  slug="${item%%|*}"
  domain="${item##*|}"
  target_dir="${OUT_ROOT}/${domain}"
  log_file="/tmp/domain-build-${slug}.log"

  echo "[${index}/${total}] Building ${slug} -> ${domain}"
  (
    cd "${ROOT_DIR}"
    NEXT_PUBLIC_ACTIVE_DOMAIN_SLUG="${slug}" \
    NEXT_PUBLIC_APP_URL="https://${domain}" \
    npm run build >"${log_file}" 2>&1
  ) || {
    echo "Build failed for ${slug}. Log: ${log_file}" >&2
    tail -n 120 "${log_file}" >&2 || true
    exit 1
  }

  rm -rf "${target_dir}"
  mkdir -p "${target_dir}"
  cp -R "${ROOT_DIR}/out/." "${target_dir}/"

  # Domain-only bundle: remove cross-site hubs and calculator routes.
  rm -rf \
    "${target_dir}/domains" \
    "${target_dir}/domains.html" \
    "${target_dir}/domains.txt" \
    "${target_dir}/sites" \
    "${target_dir}/sites.html" \
    "${target_dir}/sites.txt" \
    "${target_dir}/ops" \
    "${target_dir}/ops.html" \
    "${target_dir}/ops.txt" \
    "${target_dir}/takehome" \
    "${target_dir}/member.html" \
    "${target_dir}/member.txt" \
    "${target_dir}/cancel.html" \
    "${target_dir}/cancel.txt" \
    "${target_dir}/success.html" \
    "${target_dir}/success.txt"
done

echo "Done. Generated static bundles in: ${OUT_ROOT}"
