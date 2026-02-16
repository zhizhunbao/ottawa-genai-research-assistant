# ================================
# Frontend Dockerfile (React + Vite → Nginx)
# Multi-stage build: build assets, then serve via Nginx
# ================================

# ── Stage 1: Build ──
FROM node:20-alpine AS builder

WORKDIR /build

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies (cached layer)
RUN npm ci --ignore-scripts

# Copy source code
COPY . .

# Build for production
RUN npm run build

# ── Stage 2: Serve via Nginx ──
FROM nginx:alpine AS runtime

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /build/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -q --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
