#!/bin/bash
# Pull the deployed site down over curl (the sandbox proxy lets curl out but
# not the browser) so Playwright can audit the real published bytes locally.
set -e
BASE=https://clepbo.github.io/Thomas-Emmanuel-Ayodele-
REPO="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${1:-$REPO/.livemirror}"
mkdir -p "$DEST/assets/img" "$DEST/assets/images"
# List the pages from the repo, not from the caller's cwd — mirroring the
# scratchpad's own stray .html files was how this quietly fetched nothing.
for f in $(cd "$REPO" && ls *.html) shared.css shared.js content.js; do
  curl -sS --fail --max-time 30 "$BASE/$f" -o "$DEST/$f" || echo "MISS $f"
done
for f in $(cd "$REPO/assets/img" && ls); do
  curl -sS --fail --max-time 30 "$BASE/assets/img/$f" -o "$DEST/assets/img/$f" || echo "MISS img/$f"
done
for f in $(cd "$REPO/assets/images" && ls); do
  curl -sS --fail --max-time 60 "$BASE/assets/images/$f" -o "$DEST/assets/images/$f" || echo "MISS images/$f"
done
echo "mirrored: $(find "$DEST" -type f | wc -l) files"
