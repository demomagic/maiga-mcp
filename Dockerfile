FROM node:20-slim

# Install system dependencies for keytar (libsecret-1)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libsecret-1-dev \
    build-essential \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

CMD ["node", ".smithery/shttp/module.js"]
