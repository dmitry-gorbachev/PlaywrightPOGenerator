#!/bin/sh
set -e

echo "========================================="
echo "Playwright Page Object Generator"
echo "========================================="
echo ""

# Start the Node.js application
exec node dist/server.js
