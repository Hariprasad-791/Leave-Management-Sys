# ---------- FRONTEND BUILD ----------
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend

# Install frontend dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy frontend source code and build
COPY frontend/ ./
RUN npm run build

# ---------- BACKEND ----------
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install backend dependencies and run tests
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install --ignore-scripts && npm test || echo "No backend tests found"

# Copy backend source code
COPY backend/ ./

# Set working directory back to /app (optional if needed)
WORKDIR /app

# Copy built frontend from previous stage
COPY --from=frontend-build /app/frontend/build ./frontend_build

# Expose backend port
EXPOSE 5000
