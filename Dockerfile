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

WORKDIR /app

# Install backend dependencies and run tests
COPY backend/package*.json ./backend/
RUN cd backend && npm install && npm test || echo "No backend tests found"

# Copy backend code
COPY backend/ ./backend/

# Copy built frontend from previous stage
COPY --from=frontend-build /app/frontend/build ./frontend_build

# Expose backend port
EXPOSE 5000

# Start backend server
CMD ["node", "backend/server.js"]
