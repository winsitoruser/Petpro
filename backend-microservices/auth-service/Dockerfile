FROM node:18-alpine AS development

# Create app directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy application source
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Set NODE_ENV
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Create app directory
WORKDIR /usr/src/app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built application from development stage
COPY --from=development /usr/src/app/dist ./dist
COPY --from=development /usr/src/app/src/database ./src/database
COPY --from=development /usr/src/app/sequelize.config.js ./
COPY --from=development /usr/src/app/.sequelizerc ./

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs

# Change ownership of the application files
RUN chown -R nestjs:nodejs /usr/src/app

# Set user to non-root
USER nestjs

# Expose application port
EXPOSE 3001

# Define health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/v1/health/liveness || exit 1

# Start the application
CMD ["node", "dist/main"]
