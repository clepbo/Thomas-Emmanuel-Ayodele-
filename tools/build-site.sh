#!/usr/bin/env bash
#
# Stage the publishable site into _site/.
#
# The site is plain static files at the repo root, so there is nothing to
# compile — this only decides what ships. Both publishing workflows call it,
# so the two paths cannot drift apart on which files reach the web.
#
# Usage: tools/build-site.sh [outdir]   (default: _site)
set -euo pipefail

cd "$(dirname "$0")/.."
OUT="${1:-_site}"

rm -rf "$OUT"
mkdir -p "$OUT/assets"

cp ./*.html shared.css shared.js content.js "$OUT/"

# Only the asset directories the site actually links to. assets/projects
# holds the full-size originals the WebP variants in assets/img were derived
# from — 6.6MB nothing on the site requests.
cp -r assets/img assets/images "$OUT/assets/"

# Pages runs Jekyll by default, which would skip files it does not
# recognise. This opts out and publishes the tree as-is.
touch "$OUT/.nojekyll"

echo "staged $(find "$OUT" -type f | wc -l) files into $OUT ($(du -sh "$OUT" | cut -f1))"
