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
COPY Tests/ ./Tests/
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
RUN npm ci --only=production

# Copy compiled code from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Create temp directory for uploads
RUN mkdir -p .temp

# Expose port
EXPOSE 8081

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8081/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the application
CMD ["node", "dist/server.js"]
