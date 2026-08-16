#!/bin/bash
# Preview the site locally with Vercel-style clean URLs
cd "$(dirname "$0")"
exec python3 serve.py "${1:-8080}"
