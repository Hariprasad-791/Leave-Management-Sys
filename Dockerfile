# Multi-stage build for production optimization
FROM node:18-alpine AS frontend-build

# Set working directory for frontend
WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy frontend source and build
COPY frontend/ ./
RUN npm run build

# Backend stage
FROM node:18-alpine AS backend-build

# Set working directory for backend
WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy backend source
COPY backend/ ./

# Production stage
FROM node:18-alpine AS production

# Create app directory
WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy backend from build stage
COPY --from=backend-build --chown=nodejs:nodejs /app/backend ./

# Copy frontend build from build stage
COPY --from=frontend-build --chown=nodejs:nodejs /app/frontend/build ./frontend_build

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Start the application
CMD ["node", "server.js"]
