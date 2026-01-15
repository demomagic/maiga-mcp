# Simplified Dockerfile for Maiga MCP Server
# Using npm run dev for simpler deployment
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install runtime dependencies
# - dumb-init: for proper signal handling
# - libsecret-1-0: required by smithery dev (keytar dependency)
RUN apt-get update && apt-get install -y \
    dumb-init \
    libsecret-1-0 \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN groupadd -g 1001 nodejs && \
    useradd -r -u 1001 -g nodejs nodejs

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for smithery dev)
RUN npm ci && \
    npm cache clean --force

# Copy source code
COPY . .

# Run smithery build to create .smithery/index.cjs
RUN npx smithery build

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port (Smithery default is 8081)
EXPOSE 8081

# Environment variables
# HOST=0.0.0.0 is CRITICAL for Docker - allows external connections
# Without this, the server only listens on 127.0.0.1 (localhost) and cannot be accessed from outside the container
ENV HOST=0.0.0.0
ENV PORT=8081
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8081/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the MCP server directly (already built during Docker build)
CMD ["node", ".smithery/index.cjs"]
