#!/bin/bash
# Preview the site locally at http://localhost:8080
cd "$(dirname "$0")"
echo "Bottle Builders is at http://localhost:8080  (ctrl-c to stop)"
python3 -m http.server 8080
