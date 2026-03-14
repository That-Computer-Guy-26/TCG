#!/bin/bash

# ============================================================
# TCG WEBSITE v2.0 - DOCKER ONE-CLICK INSTALLER
# ============================================================

set -e

echo "
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║      🐳 TCG WEBSITE - DOCKER INSTALLER (ONE-CLICK) 🐳        ║
║                                                                ║
║  This will run your entire system in Docker containers        ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ── CHECK DOCKER ──
echo -e "${BLUE}Checking Docker installation...${NC}\n"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}\n"
    echo "Download Docker Desktop:"
    echo "  macOS & Windows: https://www.docker.com/products/docker-desktop"
    echo "  Linux: https://docs.docker.com/engine/install/"
    exit 1
fi

echo -e "${GREEN}✓ Docker is installed${NC}"

# Check Docker daemon
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker daemon is not running${NC}\n"
    echo "Please start Docker Desktop and try again"
    exit 1
fi

echo -e "${GREEN}✓ Docker daemon is running${NC}\n"

# ── CREATE .ENV IF NEEDED ──
echo -e "${BLUE}Checking configuration...${NC}\n"

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << 'EOF'
# TCG WEBSITE - Docker Configuration
PORT=3000
FIREBASE_DB_URL=https://babysitter-b322c-default-rtdb.firebaseio.com
FIREBASE_PROJECT_ID=babysitter-b322c

# Add your credentials here:
# GOOGLE_APPLICATION_CREDENTIALS=
# EMAIL_USER=
# EMAIL_PASS=
# TWILIO_ACCOUNT_SID=
# TWILIO_AUTH_TOKEN=
# TWILIO_PHONE_NUMBER=
EOF
    
    echo -e "${YELLOW}⚠ .env file created - edit with your credentials${NC}"
    echo ""
else
    echo -e "${GREEN}✓ .env file exists${NC}\n"
fi

# ── BUILD IMAGE ──
echo -e "${BLUE}Building Docker image...${NC}\n"

docker build -t tcg-website:latest -f Dockerfile .

echo -e "${GREEN}✓ Image built${NC}\n"

# ── RUN CONTAINER ──
echo -e "${BLUE}Starting containers...${NC}\n"

# Stop existing containers
docker-compose down 2>/dev/null || true

# Start new containers
docker-compose up

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                  ✅ SYSTEM STARTED! ✅                        ║"
echo "╠════════════════════════════════════════════════════════════════╣"
echo "║                                                                ║"
echo "║  Your TCG Website is now running in Docker!                   ║"
echo "║                                                                ║"
echo "║  📱 Frontend:  http://localhost:5000                          ║"
echo "║  🔌 Backend:   http://localhost:3000                          ║"
echo "║  🎛️  Admin:    http://localhost:5000/admin                    ║"
echo "║                                                                ║"
echo "║  To stop: Press Ctrl+C                                        ║"
echo "║  To remove: docker-compose down                               ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
