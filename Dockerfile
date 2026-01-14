# Multi-stage build for Maiga MCP Server
# Using Debian-based image for better compatibility with native modules (keytar/libsecret)
FROM node:20-slim AS builder

# Set working directory
WORKDIR /app

# Install build dependencies required by @smithery/cli (keytar needs libsecret)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    libsecret-1-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the MCP server
RUN npx smithery build

# Production stage
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apt-get update && apt-get install -y \
    dumb-init \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN groupadd -g 1001 nodejs && \
    useradd -r -u 1001 -g nodejs nodejs

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev && \
    npm cache clean --force

# Copy built files from builder stage
COPY --from=builder /app/.smithery ./.smithery
COPY --from=builder /app/src ./src

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port (Smithery default is 8081)
EXPOSE 8081

# Environment variables (can be overridden at runtime)
ENV NODE_ENV=production
ENV PORT=8081

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8081/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the MCP server
CMD ["node", ".smithery/index.cjs"]
