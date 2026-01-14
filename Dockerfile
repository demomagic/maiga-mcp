# Use official Node.js LTS version with Debian slim
FROM node:20-slim

# Install system dependencies including libsecret
RUN apt-get update && apt-get install -y \
    libsecret-1-0 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Install Smithery CLI
RUN npm install -g @smithery/cli@latest

# Copy project files
COPY . .

# Build the project
RUN npm run build

# Expose the port
EXPOSE 3000

ARG SMITHERY_API_KEY

# Run the Smithery playground
CMD ["/bin/sh", "-c", "npx @smithery/cli@latest playground --port 3000 --key $SMITHERY_API_KEY"]
