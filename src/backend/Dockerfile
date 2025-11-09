# syntax=docker/dockerfile:1.7

# =============================================================================
# Stage 1: Base image with security updates
# =============================================================================
FROM node:22.11.0-alpine3.20 AS base

# Install security updates and essential tools, create user in single layer
RUN apk update && \
    apk upgrade --no-cache && \
    apk add --no-cache \
        dumb-init \
        curl \
        ca-certificates \
        tzdata && \
    rm -rf /var/cache/apk/* && \
    update-ca-certificates && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production \
    NPM_CONFIG_LOGLEVEL=warn \
    NPM_CONFIG_COLOR=false \
    NPM_CONFIG_AUDIT=false \
    NPM_CONFIG_FUND=false \
    NODE_OPTIONS="--enable-source-maps --max-old-space-size=2048" \
    PATH="/usr/local/share/.config/yarn/global/node_modules/.bin:/usr/local/bin:$PATH" \
    TZ=UTC

# =============================================================================
# Stage 2: Install production dependencies only
# =============================================================================
FROM base AS deps

# Copy only package files for better layer caching
COPY --chown=nodejs:nodejs package.json package-lock.json* yarn.lock* ./

# Install production dependencies with BuildKit cache mount
RUN --mount=type=cache,target=/root/.yarn,sharing=locked \
    --mount=type=cache,target=/root/.npm,sharing=locked \
    if [ -f yarn.lock ]; then \
        yarn install --frozen-lockfile --production --no-audit; \
    elif [ -f package-lock.json ]; then \
        npm ci --omit=dev --no-audit --no-fund; \
    else \
        npm install --omit=dev --no-audit --no-fund; \
    fi && \
    yarn cache clean 2>/dev/null || npm cache clean --force && \
    chown -R nodejs:nodejs /app/node_modules

# =============================================================================
# Stage 3: Install all dependencies (including dev) for building
# =============================================================================
FROM base AS deps-dev

# Copy only package files for better layer caching
COPY --chown=nodejs:nodejs package.json package-lock.json* yarn.lock* ./

# Install all dependencies (including dev) with BuildKit cache mount
RUN --mount=type=cache,target=/root/.yarn,sharing=locked \
    --mount=type=cache,target=/root/.npm,sharing=locked \
    if [ -f yarn.lock ]; then \
        yarn install --frozen-lockfile --no-audit && \
        yarn global add @nestjs/cli && \
        chown -R nodejs:nodejs /usr/local/share/.config/yarn/global 2>/dev/null || true; \
    elif [ -f package-lock.json ]; then \
        npm ci --no-audit --no-fund && \
        npm install -g @nestjs/cli && \
        chown -R nodejs:nodejs /usr/local/lib/node_modules/@nestjs 2>/dev/null || true; \
    else \
        npm install --no-audit --no-fund && \
        npm install -g @nestjs/cli && \
        chown -R nodejs:nodejs /usr/local/lib/node_modules/@nestjs 2>/dev/null || true; \
    fi && \
    yarn cache clean 2>/dev/null || npm cache clean --force && \
    chown -R nodejs:nodejs /app/node_modules

# =============================================================================
# Stage 4: Build application
# =============================================================================
FROM deps-dev AS builder

# Copy build configuration files and source code
COPY --chown=nodejs:nodejs tsconfig*.json nest-cli.json ormconfig.ts ./
COPY --chown=nodejs:nodejs src ./src

# Build the application and verify output
RUN nest build && \
    test -f /app/dist/main.js || exit 1 && \
    chown -R nodejs:nodejs /app/dist

# =============================================================================
# Stage 5: Production runtime (minimal)
# =============================================================================
FROM node:22.11.0-alpine3.20 AS runner

# Install only essential runtime tools (no curl, no ca-certificates update needed)
RUN apk add --no-cache dumb-init tzdata && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs && \
    rm -rf /var/cache/apk/*

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production \
    NODE_OPTIONS="--enable-source-maps --max-old-space-size=2048" \
    TZ=UTC

# Add comprehensive metadata labels (OCI standard)
LABEL maintainer="Git Visualize Engine Team" \
      org.opencontainers.image.title="Git Visualize Engine Backend" \
      org.opencontainers.image.description="Backend API for Git Visualize Engine" \
      org.opencontainers.image.vendor="Git Visualize Engine" \
      org.opencontainers.image.version="${IMAGE_VERSION:-latest}" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.revision="${GIT_COMMIT:-unknown}" \
      org.opencontainers.image.licenses="UNLICENSED"

# Copy production dependencies, built application, and package.json
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --chown=nodejs:nodejs package.json ./package.json

# Verify dist/main.js exists after copy
RUN test -f /app/dist/main.js || exit 1

# Switch to non-root user for security
USER nodejs

# Expose application port
EXPOSE 8000

# Health check with proper configuration
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8000/docs', (r) => { \
        process.exit(r.statusCode === 200 ? 0 : 1); \
    }).on('error', () => process.exit(1));"

# Use dumb-init for proper signal handling (SIGTERM, SIGINT, etc.)
ENTRYPOINT ["dumb-init", "--"]

# Start application with source maps enabled
CMD ["node", "--enable-source-maps", "dist/main.js"]
