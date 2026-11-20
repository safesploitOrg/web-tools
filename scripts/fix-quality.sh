#!/usr/bin/env bash
set -euo pipefail

readonly PROJECT_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"

main() {
  cd "$PROJECT_ROOT"

  if [[ ! -f package-lock.json ]]; then
    printf '%s\n' '[INFO] No lockfile found; generating one before running npm ci.'
    npm install --package-lock-only --ignore-scripts --no-audit --no-fund
  fi

  npm ci --ignore-scripts --no-fund
  npm run format
  npm run check
  npm audit --audit-level=high

  printf '\n%s\n' '[PASS] Local formatting, checks and dependency audit completed.'
  printf '%s\n' 'Review the changed files, including package-lock.json, and commit them.'
}

main "$@"
