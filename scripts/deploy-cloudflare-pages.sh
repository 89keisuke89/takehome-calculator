#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DOMAIN_OUT_DIR="${DOMAIN_OUT_DIR:-${ROOT_DIR}/domain-out}"
PROJECT_PREFIX="${PAGES_PROJECT_PREFIX:-}"
PRODUCTION_BRANCH="${PAGES_PRODUCTION_BRANCH:-main}"
SKIP_BUILD="${SKIP_BUILD:-0}"
ADD_CUSTOM_DOMAINS="${ADD_CUSTOM_DOMAINS:-0}"
SKIP_DEPLOY="${SKIP_DEPLOY:-0}"

if [[ -f "${ROOT_DIR}/.env.local" ]]; then
  set -a
  # shellcheck disable=SC1091
  . "${ROOT_DIR}/.env.local"
  set +a
fi

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

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  echo "CLOUDFLARE_API_TOKEN is required." >&2
  exit 1
fi

if [[ "${ADD_CUSTOM_DOMAINS}" == "1" ]] && [[ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]]; then
  echo "CLOUDFLARE_ACCOUNT_ID is required when ADD_CUSTOM_DOMAINS=1." >&2
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

if [[ "${SKIP_BUILD}" != "1" ]]; then
  echo "Building all domain bundles..."
  (cd "${ROOT_DIR}" && npm run build:domains)
fi

if [[ ! -d "${DOMAIN_OUT_DIR}" ]]; then
  echo "Domain output directory not found: ${DOMAIN_OUT_DIR}" >&2
  exit 1
fi

echo "Fetching existing Pages projects..."
PROJECTS_JSON="$(cd "${ROOT_DIR}" && npx --yes wrangler pages project list --json)"
PROJECT_NAMES="$(printf "%s" "${PROJECTS_JSON}" | node -e 'const fs=require("fs");const raw=fs.readFileSync(0,"utf8");const arr=JSON.parse(raw);for(const p of arr){const name=(p&& (p.name || p["Project Name"]))||""; if(name) process.stdout.write(`${name}\n`);}')" || {
  echo "Failed to parse project list." >&2
  exit 1
}

total="${#TARGETS[@]}"
index=0

for item in "${TARGETS[@]}"; do
  index=$((index + 1))
  slug="${item%%|*}"
  domain="${item##*|}"
  project_name="${PROJECT_PREFIX}${slug}"
  static_dir="${DOMAIN_OUT_DIR}/${domain}"

  if [[ ! -d "${static_dir}" ]]; then
    echo "[${index}/${total}] Missing static bundle: ${static_dir}" >&2
    exit 1
  fi

  echo "[${index}/${total}] ${domain} -> project ${project_name}"
  if ! printf "%s\n" "${PROJECT_NAMES}" | rg -qx "${project_name}"; then
    echo "  Creating Pages project: ${project_name}"
    (cd "${ROOT_DIR}" && npx --yes wrangler pages project create "${project_name}" --production-branch "${PRODUCTION_BRANCH}")
    PROJECT_NAMES="$(printf "%s\n%s\n" "${PROJECT_NAMES}" "${project_name}")"
  fi

  if [[ "${SKIP_DEPLOY}" != "1" ]]; then
    echo "  Deploying ${static_dir}"
    (
      cd "${ROOT_DIR}" && \
        npx --yes wrangler pages deploy "${static_dir}" \
          --project-name "${project_name}" \
          --branch "${PRODUCTION_BRANCH}" \
          --commit-dirty=true \
          --commit-message "deploy: ${domain}"
    )
  fi

  if [[ "${ADD_CUSTOM_DOMAINS}" == "1" ]]; then
    echo "  Ensuring custom domain: ${domain}"
    API_RESPONSE="$(curl -sS -X POST \
      "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects/${project_name}/domains" \
      -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
      -H "Content-Type: application/json" \
      --data "{\"name\":\"${domain}\"}")"

    if printf "%s" "${API_RESPONSE}" | rg -q '"success":true'; then
      echo "  Added custom domain ${domain}"
    elif printf "%s" "${API_RESPONSE}" | rg -q 'already'; then
      echo "  Custom domain already exists: ${domain}"
    else
      echo "  Domain API response: ${API_RESPONSE}"
    fi
  fi
done

echo "All deployments completed."
echo "Pages project URLs:"
for item in "${TARGETS[@]}"; do
  slug="${item%%|*}"
  domain="${item##*|}"
  project_name="${PROJECT_PREFIX}${slug}"
  echo "- https://${project_name}.pages.dev  (${domain})"
done
