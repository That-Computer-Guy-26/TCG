#!/bin/bash

set -e

echo "
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║        🚀 TCG WEBSITE v2.0 - INSTALLATION 🚀                  ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Step 1: Checking prerequisites...${NC}\n"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Install from: https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js ${NODE_VERSION}${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓ npm ${NPM_VERSION}${NC}"

echo -e "\n${BLUE}Step 2: Installing dependencies...${NC}\n"

npm install --silent
echo -e "${GREEN}✓ Dependencies installed${NC}"

echo -e "\n${BLUE}Step 3: Creating .env file...${NC}\n"

if [ ! -f ".env" ]; then
    cat > .env << 'EOF'
# TCG WEBSITE - Configuration
PORT=3000
FIREBASE_DB_URL=https://babysitter-b322c-default-rtdb.firebaseio.com
FIREBASE_PROJECT_ID=babysitter-b322c

# Email (optional)
EMAIL_SERVICE=gmail
EMAIL_USER=
EMAIL_PASS=

# SMS (optional)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Stripe (optional)
STRIPE_SECRET_KEY=
EOF
    echo -e "${GREEN}✓ .env file created${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

echo -e "\n${BLUE}Step 4: Verifying installation...${NC}\n"

npm run build
echo -e "${GREEN}✓ Build successful${NC}"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                  ✅ INSTALLATION COMPLETE! ✅                 ║"
echo "╠════════════════════════════════════════════════════════════════╣"
echo "║                                                                ║"
echo "║  Next steps:                                                   ║"
echo "║                                                                ║"
echo "║  1. Start your system:                                         ║"
echo "║     npm start                                                  ║"
echo "║                                                                ║"
echo "║  2. Visit in your browser:                                     ║"
echo "║     http://localhost:3000                                      ║"
echo "║                                                                ║"
echo "║  3. Setup Firebase integration:                                ║"
echo "║     chmod +x setup-integration.sh                              ║"
echo "║     ./setup-integration.sh                                     ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"

echo ""
