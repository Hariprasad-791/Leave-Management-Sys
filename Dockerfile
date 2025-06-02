# Multi-stage build for production optimization
FROM node:18-alpine AS frontend-build

# Set working directory for frontend
WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install dependencies (including dev dependencies for testing)
RUN npm ci

# Copy frontend source
COPY frontend/ ./

# Run frontend tests with coverage
RUN npm run test:ci

# Build frontend for production
RUN npm run build

# Backend stage
FROM node:18-alpine AS backend-build

# Set working directory for backend
WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./

# Install all dependencies (including dev dependencies for testing)
RUN npm ci

# Copy backend source
COPY backend/ ./

# Run backend tests with coverage
RUN npm run test:ci

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM node:18-alpine AS production

# Create app directory
WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy backend from build stage (production dependencies only)
COPY --from=backend-build --chown=nodejs:nodejs /app/backend ./

# Copy frontend build from build stage
COPY --from=frontend-build --chown=nodejs:nodejs /app/frontend/build ./frontend_build

# Copy test coverage reports (optional - for debugging)
COPY --from=frontend-build --chown=nodejs:nodejs /app/frontend/coverage ./frontend_coverage
COPY --from=backend-build --chown=nodejs:nodejs /app/backend/coverage ./backend_coverage

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Start the application
CMD ["node", "server.js"]
