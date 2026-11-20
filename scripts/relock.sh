#!/usr/bin/env bash
set -euo pipefail

readonly PROJECT_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"

main() {
  cd "$PROJECT_ROOT"
  npm install --package-lock-only --ignore-scripts --no-audit --no-fund
  npm ci --ignore-scripts --no-fund
  npm run check
  printf '\nLockfile ready: %s/package-lock.json\n' "$PROJECT_ROOT"
  printf 'Review and commit package-lock.json before triggering a Pages release.\n'
}

main "$@"
