# Backend Dockerfile for Rugby Score Tracker API
# Multi-stage for smaller production image

FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Start the server
CMD ["node", "server.js"]
