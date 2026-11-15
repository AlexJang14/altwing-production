#!/bin/zsh
set -e
npm run lint
npm run build
npm run guidance:freshness
echo "✅ AltWing Engineering Counselor V2 verified"
