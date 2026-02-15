#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

npm ci
npm run fixtures:gen
npm run lint
npm test
npm run build
npm run docs:build
npm pack --dry-run
npm pack

echo "Release bundle generated in project root (*.tgz)."
