#!/bin/bash

# ============================================================
# TCG WEBSITE v2.0 - ONE-CLICK CLOUD DEPLOYMENT
# Deploys to Firebase Hosting + Cloud Run
# ============================================================

set -e

echo "
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║    🚀 TCG WEBSITE - CLOUD DEPLOYMENT (ONE-CLICK) 🚀          ║
║                                                                ║
║  This will deploy your system to the cloud:                   ║
║  • Frontend → Firebase Hosting                                ║
║  • Backend → Cloud Run (optional)                             ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ── CHECK PREREQUISITES ──
echo -e "${BLUE}Checking prerequisites...${NC}\n"

check_cmd() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 not found${NC}"
        return 1
    else
        echo -e "${GREEN}✓ $1${NC}"
        return 0
    fi
}

check_cmd "node" || exit 1
check_cmd "npm" || exit 1
check_cmd "firebase" || {
    echo -e "\n${YELLOW}Installing Firebase CLI...${NC}"
    npm install -g firebase-tools
}

echo ""

# ── DEPLOYMENT OPTIONS ──
echo -e "${BLUE}Select deployment option:${NC}\n"
echo "1) Frontend Only (Firebase Hosting)"
echo "2) Frontend + Backend (Firebase + Cloud Run)"
echo "3) Docker Deploy"
echo ""
read -p "Choose option (1-3): " option

case $option in
    1)
        echo -e "\n${BLUE}Deploying Frontend to Firebase Hosting...${NC}\n"
        npm run build
        firebase deploy --only hosting
        echo -e "\n${GREEN}✓ Frontend deployed!${NC}"
        echo "URL: https://babysitter-b322c.web.app"
        ;;
    2)
        echo -e "\n${BLUE}Deploying Frontend + Backend...${NC}\n"
        
        # Build frontend
        npm run build
        
        # Deploy to Firebase
        firebase deploy --only hosting
        
        # Deploy backend to Cloud Run
        if command -v gcloud &> /dev/null; then
            echo -e "\n${BLUE}Deploying backend to Cloud Run...${NC}\n"
            
            # Build and push Docker image
            docker build -t gcr.io/babysitter-b322c/tcg-backend .
            docker push gcr.io/babysitter-b322c/tcg-backend
            
            # Deploy to Cloud Run
            gcloud run deploy tcg-backend \
                --image gcr.io/babysitter-b322c/tcg-backend:latest \
                --platform managed \
                --region us-central1 \
                --allow-unauthenticated \
                --memory 512Mi
            
            echo -e "${GREEN}✓ Backend deployed to Cloud Run!${NC}"
        else
            echo -e "${YELLOW}⚠ gcloud CLI not found${NC}"
            echo "Install from: https://cloud.google.com/sdk/docs/install"
        fi
        ;;
    3)
        echo -e "\n${BLUE}Docker Deployment...${NC}\n"
        
        if ! command -v docker &> /dev/null; then
            echo -e "${RED}❌ Docker not installed${NC}"
            echo "Download from: https://www.docker.com/products/docker-desktop"
            exit 1
        fi
        
        echo "Building Docker image..."
        docker build -t tcg-website:latest .
        
        echo "Starting container..."
        docker run -it \
            -p 3000:3000 \
            -p 5000:5000 \
            --env-file .env \
            tcg-website:latest
        ;;
    *)
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                  ✅ DEPLOYMENT COMPLETE! ✅                   ║"
echo "╠════════════════════════════════════════════════════════════════╣"
echo "║                                                                ║"
echo "║  Your TCG Website is now live!                                ║"
echo "║  🌐 https://babysitter-b322c.web.app                         ║"
echo "║                                                                ║"
echo "║  Monitor your deployment:                                     ║"
echo "║  📊 https://console.firebase.google.com                       ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
