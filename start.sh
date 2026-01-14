#!/bin/sh
set -e

# Set SMITHERY_API_KEY if not already set
export SMITHERY_API_KEY="${SMITHERY_API_KEY:-b0fa02fa-c699-4394-86ea-bc020cea3072}"

# Force non-interactive mode for CI/container environments
export CI=true
export SMITHERY_NON_INTERACTIVE=true

echo "🔨 Building MCP server..."
npx smithery build

echo "🚀 Starting MCP server..."
echo "📡 Server will be available on port ${PORT:-8081}"
exec node .smithery/index.cjs
