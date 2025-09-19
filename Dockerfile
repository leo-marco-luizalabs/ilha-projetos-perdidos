# Multi-stage Dockerfile for Vite React app
# Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --silent

# Copy source and build
COPY . .
RUN npm run build

# Production stage: serve with nginx
FROM nginx:stable-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config (if exists)
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["/bin/sh", "-c", "nginx -g 'daemon off;' "]
