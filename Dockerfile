# Multi-stage build for Maiga MCP Server
FROM node:20-slim AS base

# Install system dependencies required for native modules
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    libsecret-1-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
FROM base AS deps
RUN npm ci --only=production && npm cache clean --force

# Build stage
FROM base AS builder
COPY package.json package-lock.json* ./

# Install ALL dependencies including devDependencies (needed for build)
RUN npm ci

# Copy source code and config
COPY . .

# Build the application using npx to ensure CLI is found
RUN npx @smithery/cli build

# Production stage
FROM node:20-slim AS runner

# Install runtime system dependencies (including libsecret for keytar if needed)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libsecret-1-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 mcpuser

# Copy built application from builder
COPY --from=builder --chown=mcpuser:nodejs /app/.smithery ./.smithery
COPY --from=deps --chown=mcpuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=mcpuser:nodejs /app/package.json ./
COPY --from=builder --chown=mcpuser:nodejs /app/smithery.yaml ./

# Switch to non-root user
USER mcpuser

# Expose default port (adjust if needed)
EXPOSE 8081

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8081

# Default command (adjust based on how Smithery servers run)
# Note: Smithery servers typically run via their platform,
# but this Dockerfile can be used for local/alternative deployments
CMD ["node", ".smithery/index.cjs"]
