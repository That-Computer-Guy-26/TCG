#!/bin/bash

# ============================================================
# TCG WEBSITE - FIREBASE DEPLOYMENT SCRIPT
# Deploy frontend to Firebase Hosting
# Usage: ./deploy.sh
# ============================================================

set -e

echo "╔════════════════════════════════════════════════════════╗"
echo "║        TCG WEBSITE - FIREBASE DEPLOYMENT              ║"
echo "╚════════════════════════════════════════════════════════╝"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Install with:"
    echo "   npm install -g firebase-tools"
    exit 1
fi

# Check if Node modules exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build frontend
echo "🔨 Building frontend..."
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Build failed! dist/ directory not found."
    exit 1
fi

echo "✅ Build successful"

# Check if logged in to Firebase
if ! firebase projects:list > /dev/null 2>&1; then
    echo "🔐 You need to login to Firebase:"
    firebase login
fi

# Deploy to Firebase Hosting
echo "🚀 Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║                 DEPLOYMENT SUCCESSFUL!                ║"
echo "╠════════════════════════════════════════════════════════╣"
echo "║                                                        ║"
echo "║  Frontend URL: https://babysitter-b322c.web.app       ║"
echo "║  Backend URL:  http://localhost:3000 (or Cloud Run)    ║"
echo "║  Database:     Firebase Realtime DB                    ║"
echo "║                                                        ║"
echo "║  Next steps:                                           ║"
echo "║  1. Test the website at the Firebase URL above         ║"
echo "║  2. Make sure backend is running (locally or Cloud Run)║"
echo "║  3. Verify bookings appear in Firebase Console         ║"
echo "║                                                        ║"
echo "╚════════════════════════════════════════════════════════╝"
