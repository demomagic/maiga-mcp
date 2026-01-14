#!/bin/sh
set -e

echo "🔨 Building MCP server..."
npx smithery build

echo "🚀 Starting MCP server..."
echo "📡 Server will be available on port ${PORT:-8081}"
exec node .smithery/index.cjs
