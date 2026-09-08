#!/usr/bin/env bash
set -euo pipefail

URL="${1:-http://localhost:3000/api/submit}"
TOTAL=31
WINDOW_MS=60000

echo "Running ${TOTAL} requests against ${URL}"
echo "================================"

for i in $(seq 1 "${TOTAL}"); do
  echo "--- Request ${i} ---"
  curl -i "${URL}" -X POST 2>/dev/null \
    | grep -E "^(HTTP|X-RateLimit|Retry-After)"
done

echo "================================"
echo "Waiting ${WINDOW_MS}ms for rate-limit window to reset..."
sleep "$((WINDOW_MS / 1000))"

echo "--- Request after window reset ---"
curl -i "${URL}" -X POST 2>/dev/null \
  | grep -E "^(HTTP|X-RateLimit|Retry-After)"
