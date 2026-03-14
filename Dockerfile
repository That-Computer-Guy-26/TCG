# TCG Backend - Cloud Run Deployment
# Build: docker build -t tcg-backend .
# Run:   docker run -p 3000:3000 --env-file .env tcg-backend

FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json .
COPY package-lock.json* .

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY server.mjs .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "server.mjs"]
