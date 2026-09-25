# Multi-stage build for optimized image size

# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src/ ./src/
COPY public/ ./public/
COPY tsconfig.json .

# Compile TypeScript
RUN npm run build

# Stage 2: Runtime stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Copy compiled code from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Create temp directory for uploads
RUN mkdir -p .temp && chmod 777 .temp

# Expose port
EXPOSE 8081

# Health check - allows 10s for node startup + request timeout
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8081/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)}).on('error', () => {process.exit(1)})" || exit 1

# Use the entrypoint script
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
