#!/bin/bash

# ============================================================
# TCG WEBSITE - LOCAL DEVELOPMENT STARTUP
# Start backend, frontend, and optional Firebase emulator
# Usage: ./dev.sh [--emulator]
# ============================================================

set -e

echo "╔════════════════════════════════════════════════════════╗"
echo "║      TCG WEBSITE - LOCAL DEVELOPMENT STARTUP          ║"
echo "╚════════════════════════════════════════════════════════╝"

# Check .env file
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found!"
    echo "   Creating from template..."
    cp .env.template .env
    echo "   ⚡ Please update .env with your settings"
    echo "   Then run this script again."
    exit 1
fi

echo "✅ Configuration found"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

echo ""
echo "🚀 Starting services..."
echo ""

# Start backend
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📡 BACKEND: Starting Express server on http://localhost:3000"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Use npm run dev for development with file watcher
npm run dev &
BACKEND_PID=$!

# Give backend a moment to start
sleep 2

# Check if backend started successfully
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Backend failed to start. Check the error above."
    exit 1
fi

echo "✅ Backend is running (PID: $BACKEND_PID)"
echo ""

# Optional: Start Firebase Emulator
if [ "$1" == "--emulator" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔥 FIREBASE EMULATOR: Starting on http://localhost:4000"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    firebase emulators:start &
    FIREBASE_PID=$!
    sleep 3
    echo "✅ Firebase Emulator is running (PID: $FIREBASE_PID)"
    echo ""
fi

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║               🎉 ALL SERVICES STARTED                  ║"
echo "╠════════════════════════════════════════════════════════╣"
echo "║                                                        ║"
echo "║  📡 Backend:     http://localhost:3000                ║"
echo "║     Health:      http://localhost:3000/health        ║"
echo "║     Chat API:    POST http://localhost:3000/api/ai-chat║"
echo "║                                                        ║"
echo "║  🌐 Frontend:    http://localhost:5173               ║"
echo "║     (Start in another terminal with: npm run dev)     ║"
echo "║                                                        ║"

if [ "$1" == "--emulator" ]; then
    echo "║  🔥 Firebase:    http://localhost:4000              ║"
fi

echo "║  💾 Database:    Firebase Realtime DB                 ║"
echo "║     URL: https://babysitter-b322c-default-rtdb       ║"
echo "║          .firebaseio.com                              ║"
echo "║                                                        ║"
echo "║  AI Providers (Auto-rotating):                        ║"
echo "║  1. Ollama (if running locally)                       ║"
echo "║  2. LM Studio (if running locally)                    ║"
echo "║  3. Groq (API key required)                           ║"
echo "║  4. Together.ai (API key required)                    ║"
echo "║                                                        ║"
echo "║  📝 Frontend Quick Start:                              ║"
echo "║     In another terminal, run:                         ║"
echo "║     cd frontend && npm install && npm run dev         ║"
echo "║                                                        ║"
echo "╚════════════════════════════════════════════════════════╝"

echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for interrupt
wait $BACKEND_PID

# Cleanup on exit
trap "kill $BACKEND_PID 2>/dev/null; [ -n '$FIREBASE_PID' ] && kill $FIREBASE_PID 2>/dev/null" EXIT
