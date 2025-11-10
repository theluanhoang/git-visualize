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
    adduser -S nextjs -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Set environment variables for production
ENV NODE_ENV=production \
    NPM_CONFIG_LOGLEVEL=warn \
    NPM_CONFIG_COLOR=false \
    NPM_CONFIG_AUDIT=false \
    NPM_CONFIG_FUND=false \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_OPTIONS="--enable-source-maps --max-old-space-size=2048" \
    TZ=UTC

# =============================================================================
# Stage 2: Install production dependencies only
# =============================================================================
FROM base AS deps

# Copy only package files for better layer caching
COPY --chown=nextjs:nodejs package.json package-lock.json* yarn.lock* ./

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
    chown -R nextjs:nodejs /app/node_modules

# =============================================================================
# Stage 3: Install all dependencies (including dev) for building
# =============================================================================
FROM base AS deps-dev

# Copy only package files for better layer caching
COPY --chown=nextjs:nodejs package.json package-lock.json* yarn.lock* ./

# Install all dependencies (including dev) with BuildKit cache mount
RUN --mount=type=cache,target=/root/.yarn,sharing=locked \
    --mount=type=cache,target=/root/.npm,sharing=locked \
    if [ -f yarn.lock ]; then \
        yarn install --frozen-lockfile --no-audit && \
        test -d node_modules/@tailwindcss/postcss || exit 1 && \
        test -d node_modules/tw-animate-css || exit 1; \
    elif [ -f package-lock.json ]; then \
        npm ci --no-audit --no-fund; \
    else \
        npm install --no-audit --no-fund; \
    fi && \
    yarn cache clean 2>/dev/null || npm cache clean --force && \
    chown -R nextjs:nodejs /app/node_modules

# =============================================================================
# Stage 4: Build Next.js application
# =============================================================================
FROM deps-dev AS builder

# Copy environment files (supports both .env.development and .env.production)
# Priority: .env.production > .env.development
COPY --chown=nextjs:nodejs .env.production* .env.development* ./

# Set build-time environment variables
# Memory limit: 4096 for normal, 1536 for EC2 free tier
# Can be overridden via build arg: --build-arg NODE_OPTIONS="--max-old-space-size=1536"
ARG NODE_OPTIONS="--max-old-space-size=4096"
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production \
    NODE_OPTIONS=${NODE_OPTIONS}

# Copy build configuration files, source code, and assets
COPY --chown=nextjs:nodejs next.config.ts tsconfig.json postcss.config.mjs tailwind.config.* components.json ./
COPY --chown=nextjs:nodejs src ./src
COPY --chown=nextjs:nodejs public ./public
COPY --chown=nextjs:nodejs messages ./messages

# Build Next.js application with standalone output
# Load environment variables from env file if it exists
# Priority: .env.production > .env.development
# Add progress output and error handling
RUN echo "Starting Next.js build..." && \
    if [ -f .env.production ]; then \
        echo "Loading .env.production..." && \
        set -a && \
        . .env.production && \
        set +a; \
    elif [ -f .env.development ]; then \
        echo "Loading .env.development..." && \
        set -a && \
        . .env.development && \
        set +a; \
    fi && \
    echo "Building Next.js application..." && \
    (npx next build 2>&1 || node node_modules/next/dist/bin/next build 2>&1) && \
    echo "Build completed, setting permissions..." && \
    chown -R nextjs:nodejs /app/.next && \
    echo "Build finished successfully"

# =============================================================================
# Stage 5: Production runtime (minimal)
# =============================================================================
FROM node:22.11.0-alpine3.20 AS runner

# Install only essential runtime tools (curl for healthcheck, dumb-init for signals)
RUN apk add --no-cache dumb-init curl tzdata && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs && \
    rm -rf /var/cache/apk/*

WORKDIR /app

# Set production environment variables
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_OPTIONS="--enable-source-maps --max-old-space-size=2048" \
    PORT=3000 \
    HOSTNAME="0.0.0.0" \
    TZ=UTC

# Add comprehensive metadata labels (OCI standard)
LABEL maintainer="Git Visualize Engine Team" \
      org.opencontainers.image.title="Git Visualize Engine Frontend" \
      org.opencontainers.image.description="Frontend application for Git Visualize Engine" \
      org.opencontainers.image.vendor="Git Visualize Engine" \
      org.opencontainers.image.version="${IMAGE_VERSION:-latest}" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.revision="${GIT_COMMIT:-unknown}" \
      org.opencontainers.image.licenses="UNLICENSED"

# Copy public assets, standalone build output, and static files
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user for security
USER nextjs

# Expose application port
EXPOSE 3000

# Health check with proper configuration
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# Use dumb-init for proper signal handling (SIGTERM, SIGINT, etc.)
ENTRYPOINT ["dumb-init", "--"]

# Start Next.js server with source maps enabled
CMD ["node", "--enable-source-maps", "server.js"]
