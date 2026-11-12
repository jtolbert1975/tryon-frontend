#!/usr/bin/env bash
# Build the site and publish it to S3 + CloudFront.
# Usage: scripts/deploy.sh [--skip-build]
set -euo pipefail

BUCKET="${DEPLOY_BUCKET:-adattamento-app-site}"
DISTRIBUTION_ID="${DEPLOY_DISTRIBUTION_ID:-E2K1FGFLHVGRQ4}"
REGION="${AWS_REGION:-us-east-2}"
DIST_DIR="dist/tryon-frontend/browser"

cd "$(dirname "$0")/.."

if [[ "${1:-}" != "--skip-build" ]]; then
  npm run build
fi

[[ -f "$DIST_DIR/index.html" ]] || { echo "Missing $DIST_DIR/index.html - build failed?"; exit 1; }

# 1) Everything except HTML: long cache (Angular file names contain content hashes)
aws s3 sync "$DIST_DIR" "s3://$BUCKET" --region "$REGION" --delete \
  --exclude "*.html" \
  --cache-control "public,max-age=31536000,immutable"

# 2) HTML: always revalidate so new releases show up immediately
aws s3 sync "$DIST_DIR" "s3://$BUCKET" --region "$REGION" --delete \
  --exclude "*" --include "*.html" \
  --cache-control "public,max-age=0,must-revalidate" \
  --content-type "text/html; charset=utf-8"

# 3) Clear CloudFront's edge copies
aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*" >/dev/null
echo "Deployed to https://adattamento.app (invalidation started)"
