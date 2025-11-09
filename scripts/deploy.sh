#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Git Visualize Engine Deployment${NC}"
echo -e "${GREEN}========================================${NC}"

# Configuration
EC2_USER="${EC2_USER:-ubuntu}"
EC2_HOST="${EC2_HOST}"
SSH_KEY="${SSH_KEY:-~/.ssh/id_rsa}"
APP_DIR="/opt/app"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Validate required environment variables
if [ -z "$EC2_HOST" ]; then
    echo -e "${RED}Error: EC2_HOST environment variable is not set${NC}"
    echo -e "${YELLOW}Usage: EC2_HOST=your-ec2-ip ./scripts/deploy.sh${NC}"
    exit 1
fi

# Check if SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    echo -e "${RED}Error: SSH key not found at $SSH_KEY${NC}"
    exit 1
fi

echo -e "${BLUE}Configuration:${NC}"
echo -e "  EC2 Host: ${EC2_HOST}"
echo -e "  EC2 User: ${EC2_USER}"
echo -e "  SSH Key: ${SSH_KEY}"
echo -e "  App Directory: ${APP_DIR}"
echo ""

# Check if Docker and Docker Compose are installed on EC2
echo -e "${YELLOW}Checking Docker installation on EC2...${NC}"
ssh -i "$SSH_KEY" "$EC2_USER@$EC2_HOST" "command -v docker >/dev/null 2>&1 || { echo 'Docker not installed'; exit 1; }"
ssh -i "$SSH_KEY" "$EC2_USER@$EC2_HOST" "docker compose version >/dev/null 2>&1 || docker-compose version >/dev/null 2>&1 || { echo 'Docker Compose not installed'; exit 1; }"
echo -e "${GREEN}✓ Docker and Docker Compose are installed${NC}"

# Create directory structure on EC2
echo -e "${YELLOW}Creating directory structure on EC2...${NC}"
ssh -i "$SSH_KEY" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
mkdir -p /opt/app
mkdir -p /opt/app/src/backend
mkdir -p /opt/app/src/frontend
ENDSSH
echo -e "${GREEN}✓ Directory structure created${NC}"

# Copy files to EC2
echo -e "${YELLOW}Copying files to EC2...${NC}"

# Copy docker-compose and nginx config from root
echo -e "  Copying docker-compose files..."
scp -i "$SSH_KEY" "$PROJECT_ROOT/docker-compose.prod.yml" "$EC2_USER@$EC2_HOST:$APP_DIR/"

# Copy nginx configuration folder
echo -e "  Copying nginx configuration..."
rsync -avz --delete -e "ssh -i $SSH_KEY" \
  "$PROJECT_ROOT/nginx/" "$EC2_USER@$EC2_HOST:$APP_DIR/nginx/"

# Copy backend files
echo -e "  Copying backend files..."
scp -i "$SSH_KEY" "$PROJECT_ROOT/src/backend/Dockerfile" "$EC2_USER@$EC2_HOST:$APP_DIR/src/backend/"
scp -i "$SSH_KEY" "$PROJECT_ROOT/src/backend/package.json" "$EC2_USER@$EC2_HOST:$APP_DIR/src/backend/"
scp -i "$SSH_KEY" "$PROJECT_ROOT/src/backend/package-lock.json" "$EC2_USER@$EC2_HOST:$APP_DIR/src/backend/" 2>/dev/null || true
scp -i "$SSH_KEY" "$PROJECT_ROOT/src/backend/tsconfig.json" "$EC2_USER@$EC2_HOST:$APP_DIR/src/backend/"
scp -i "$SSH_KEY" "$PROJECT_ROOT/src/backend/tsconfig.build.json" "$EC2_USER@$EC2_HOST:$APP_DIR/src/backend/" 2>/dev/null || true
scp -i "$SSH_KEY" "$PROJECT_ROOT/src/backend/nest-cli.json" "$EC2_USER@$EC2_HOST:$APP_DIR/src/backend/" 2>/dev/null || true
scp -i "$SSH_KEY" "$PROJECT_ROOT/src/backend/ormconfig.ts" "$EC2_USER@$EC2_HOST:$APP_DIR/src/backend/" 2>/dev/null || true

# Copy backend source code
echo -e "  Copying backend source code..."
rsync -avz --delete -e "ssh -i $SSH_KEY" \
  --exclude 'node_modules' \
  --exclude 'dist' \
  --exclude '.git' \
  "$PROJECT_ROOT/src/backend/src/" "$EC2_USER@$EC2_HOST:$APP_DIR/src/backend/src/"

# Copy frontend files
echo -e "  Copying frontend files..."
scp -i "$SSH_KEY" "$PROJECT_ROOT/src/frontend/Dockerfile" "$EC2_USER@$EC2_HOST:$APP_DIR/src/frontend/"
scp -i "$SSH_KEY" "$PROJECT_ROOT/src/frontend/package.json" "$EC2_USER@$EC2_HOST:$APP_DIR/src/frontend/"
scp -i "$SSH_KEY" "$PROJECT_ROOT/src/frontend/package-lock.json" "$EC2_USER@$EC2_HOST:$APP_DIR/src/frontend/" 2>/dev/null || true
scp -i "$SSH_KEY" "$PROJECT_ROOT/src/frontend/next.config.ts" "$EC2_USER@$EC2_HOST:$APP_DIR/src/frontend/"
scp -i "$SSH_KEY" "$PROJECT_ROOT/src/frontend/tsconfig.json" "$EC2_USER@$EC2_HOST:$APP_DIR/src/frontend/"
scp -i "$SSH_KEY" "$PROJECT_ROOT/src/frontend/components.json" "$EC2_USER@$EC2_HOST:$APP_DIR/src/frontend/" 2>/dev/null || true
scp -i "$SSH_KEY" "$PROJECT_ROOT/src/frontend/postcss.config.mjs" "$EC2_USER@$EC2_HOST:$APP_DIR/src/frontend/" 2>/dev/null || true
scp -i "$SSH_KEY" "$PROJECT_ROOT/src/frontend/eslint.config.mjs" "$EC2_USER@$EC2_HOST:$APP_DIR/src/frontend/" 2>/dev/null || true

# Copy frontend source code and public assets
echo -e "  Copying frontend source code..."
rsync -avz --delete -e "ssh -i $SSH_KEY" \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  "$PROJECT_ROOT/src/frontend/src/" "$EC2_USER@$EC2_HOST:$APP_DIR/src/frontend/src/"
rsync -avz --delete -e "ssh -i $SSH_KEY" \
  "$PROJECT_ROOT/src/frontend/public/" "$EC2_USER@$EC2_HOST:$APP_DIR/src/frontend/public/" 2>/dev/null || true
rsync -avz --delete -e "ssh -i $SSH_KEY" \
  "$PROJECT_ROOT/src/frontend/messages/" "$EC2_USER@$EC2_HOST:$APP_DIR/src/frontend/messages/" 2>/dev/null || true

echo -e "${GREEN}✓ Files copied successfully${NC}"

# Deploy on EC2
echo -e "${YELLOW}Deploying on EC2...${NC}"
ssh -i "$SSH_KEY" "$EC2_USER@$EC2_HOST" << ENDSSH
set -e
cd $APP_DIR

# Check if .env.production exists
if [ ! -f src/backend/.env.production ]; then
    echo -e "\033[0;33mWarning: .env.production not found. Please create it manually.\033[0m"
    echo "Creating a template .env.production file..."
    mkdir -p src/backend
    cat > src/backend/.env.production << 'ENVEOF'
# Database Configuration
DB_HOST=db
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=admin
DB_NAME=git_visualize

# Backend Configuration
NODE_ENV=production
PORT=8000

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost/api

# JWT Configuration (update these with your actual secrets)
JWT_SECRET=your-jwt-secret-key-change-this
JWT_REFRESH_SECRET=your-jwt-refresh-secret-key-change-this
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# OAuth Configuration (update with your actual credentials)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# Email Configuration (update with your actual SMTP settings)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-email-password
ENVEOF
    echo -e "\033[0;33mPlease update .env.production with your actual configuration values.\033[0m"
fi

# Set environment variables for docker-compose
export DOCKER_USERNAME=${DOCKER_USERNAME:-}
export IMAGE_TAG=${IMAGE_TAG:-latest}

# Stop existing containers
echo "Stopping existing containers..."
docker compose -f docker-compose.prod.yml down || true

# Pull images if using Docker Hub (when DOCKER_USERNAME is set)
if [ ! -z "$DOCKER_USERNAME" ]; then
    echo "Pulling latest Docker images from Docker Hub..."
    docker compose -f docker-compose.prod.yml pull || echo "Some images may need to be built"
fi

# Build and start new containers
echo "Building and starting containers..."
docker compose -f docker-compose.prod.yml up -d --build

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 30

# Run migrations
echo "Running database migrations..."
docker compose -f docker-compose.prod.yml exec -T backend npm run migration:run || echo "Migrations may have already been run"

# Clean up old images
echo "Cleaning up old images..."
docker image prune -f

# Show status
echo ""
echo "=========================================="
echo "Container status:"
echo "=========================================="
docker compose -f docker-compose.prod.yml ps

echo ""
echo "=========================================="
echo "Service URLs:"
echo "=========================================="
echo "  Frontend: http://${EC2_HOST}"
echo "  Backend API: http://${EC2_HOST}/api"
echo "  API Docs: http://${EC2_HOST}/docs"
echo "  PgAdmin: http://${EC2_HOST}:8888"
echo ""

echo "Deployment completed successfully!"
ENDSSH

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Completed!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Your application is now running at:${NC}"
echo -e "  Frontend: ${GREEN}http://${EC2_HOST}${NC}"
echo -e "  Backend API: ${GREEN}http://${EC2_HOST}/api${NC}"
echo -e "  API Docs: ${GREEN}http://${EC2_HOST}/docs${NC}"
echo -e "  PgAdmin: ${GREEN}http://${EC2_HOST}:8888${NC}"
echo ""
echo -e "${YELLOW}Note: Make sure to configure your .env.production file on EC2${NC}"
echo -e "${YELLOW}      and update security groups to allow HTTP/HTTPS traffic${NC}"

