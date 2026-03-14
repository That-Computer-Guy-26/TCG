# TCG Website - Firebase Deployment

> **That Computer Guy 26** — Professional IT Support & AI Automation  
> **Owner:** Gary Amick | **Location:** Seymour, Indiana  
> **Phone:** (812) 373-6023

---

## 🎯 Project Overview

This is a **production-ready, zero-mock-data** website for That Computer Guy with:

- **Frontend:** React + Vite → Firebase Hosting (free tier)
- **Backend:** Express.js → Local Node.js or Cloud Run (free tier)
- **Database:** Firebase Realtime Database (your existing URL)
- **AI Models:** Rotating providers (Ollama → LM Studio → Groq → Together.ai)
- **Zero Netlify:** All free-tier services only

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  THAT COMPUTER GUY 26                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  FRONTEND (React + Vite)                               │
│  ├─ Hosted on: Firebase Hosting (free)                 │
│  ├─ URL: https://babysitter-b322c.web.app            │
│  └─ Features: Chat, Services, Booking, Admin Dashboard │
│                                                         │
│  API BACKEND (Express.js)                              │
│  ├─ Option A: Local (your machine, port 3000)          │
│  ├─ Option B: Cloud Run (free tier, auto-scales)       │
│  └─ Endpoints: /api/ai-chat, /api/data/*, /api/contact│
│                                                         │
│  DATABASE (Firebase Realtime DB)                       │
│  ├─ URL: https://babysitter-b322c-default-rtdb        │
│  │        .firebaseio.com                              │
│  └─ Collections: customers, bookings, leads,           │
│                  conversations, invoices, tickets      │
│                                                         │
│  AI PROVIDERS (Automatic Rotation)                     │
│  ├─ 1. Ollama (local, offline, fastest)               │
│  ├─ 2. LM Studio (local, user-friendly)               │
│  ├─ 3. Groq (free cloud, high quality)                │
│  └─ 4. Together.ai (free cloud, backup)               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Prerequisites

### Required
- **Node.js** 18+ (download from https://nodejs.org)
- **Firebase CLI** (install: `npm install -g firebase-tools`)
- **Git** (for version control)

### Recommended (for best AI performance)
- **Ollama** (https://ollama.ai) — offline LLM, fastest
- **LM Studio** (https://lmstudio.ai) — easy local LLM
- **API Keys** (free tier):
  - Groq: https://console.groq.com/keys
  - Together.ai: https://api.together.xyz/settings/api-keys

---

## 🚀 Setup Instructions

### Step 1: Clone & Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd tcg-website-firebase

# Install backend dependencies
npm install

# Copy frontend package.json to proper location
cp frontend-package.json package.json

# Install frontend dependencies (if deploying to Firebase)
npm install
```

### Step 2: Firebase Setup

```bash
# Login to Firebase
firebase login

# Initialize Firebase project
firebase init

# Select your project: babysitter-b322c
# Use existing database URL: https://babysitter-b322c-default-rtdb.firebaseio.com

# (Optional) Test with emulator
firebase emulators:start
```

### Step 3: Configure Environment Variables

#### Backend (.env file in root)

```bash
# Copy template
cp .env.template .env

# Edit .env with your values
# CRITICAL: Set these variables
PORT=3000
FIREBASE_DB_URL=https://babysitter-b322c-default-rtdb.firebaseio.com

# Google credentials for Firebase Admin
# Get from Firebase Console > Project Settings > Service Accounts
GOOGLE_APPLICATION_CREDENTIALS='{"type":"service_account","project_id":"babysitter-b322c",...}'

# AI Providers
OLLAMA_URL=http://localhost:11434              # Local (optional)
LMSTUDIO_URL=http://localhost:1234             # Local (optional)
GROQ_API_KEY=your_groq_key_here                # Free cloud
TOGETHER_API_KEY=your_together_key_here        # Free cloud
```

#### Frontend (.env in src/)

```bash
# .env (or set in vite.config.js)
VITE_API_URL=http://localhost:3000             # Development
# VITE_API_URL=https://your-backend-url.com    # Production
```

### Step 4: Start Local Models (Optional but Recommended)

#### Option A: Ollama (Recommended)

```bash
# Download Ollama: https://ollama.ai/download
# Install and run:
ollama serve

# In another terminal, pull a model:
ollama pull llama3.1:70b

# Now backend will use it automatically
```

#### Option B: LM Studio

```bash
# Download: https://lmstudio.ai
# 1. Launch LM Studio
# 2. Download a model (e.g., Qwen 2.5 7B)
# 3. Click "Start Server" (default http://localhost:1234)
# 4. Backend will detect and use it
```

### Step 5: Start the Backend

```bash
# Development mode (with file watcher)
npm run dev

# OR production mode
npm start

# Check if it's running:
curl http://localhost:3000/health

# Expected output:
# {"status":"ok","timestamp":"2025-03-14T...","providers":[...]}
```

### Step 6: Start the Frontend (Development)

```bash
# In another terminal, if deploying locally:
cd frontend/  # or wherever package.json is
npm run dev

# Open http://localhost:5173
```

### Step 7: Test Everything

```bash
# Test AI Chat endpoint
curl -X POST http://localhost:3000/api/ai-chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What services do you offer?","context":"customer"}'

# Test data endpoint
curl http://localhost:3000/api/data/bookings

# Test contact form
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","phone":"555-0000","message":"Help!","type":"contact"}'
```

---

## 🌐 Deployment Guide

### Option A: Firebase Hosting (Frontend Only) ✅ Recommended

```bash
# Build frontend
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Your site is now live at:
# https://babysitter-b322c.web.app
```

### Option B: Cloud Run (Full Stack - Backend)

```bash
# 1. Create Dockerfile
cat > Dockerfile << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY server.mjs .
COPY .env .
EXPOSE 3000
CMD ["node", "server.mjs"]
EOF

# 2. Build and push to Google Cloud
gcloud builds submit --tag gcr.io/babysitter-b322c/tcg-backend

# 3. Deploy to Cloud Run
gcloud run deploy tcg-backend \
  --image gcr.io/babysitter-b322c/tcg-backend \
  --platform managed \
  --region us-central1 \
  --set-env-vars "$(cat .env | tr '\n' ',')" \
  --allow-unauthenticated

# Your backend API is now at:
# https://tcg-backend-xxxxx.run.app
```

### Option C: Local Backend + Firebase Hosting (Hybrid)

Best for development/testing:

```bash
# Terminal 1: Start backend
npm run dev   # Runs on localhost:3000

# Terminal 2: Build and serve frontend
cd frontend
npm run dev   # Runs on localhost:5173

# Terminal 3: Emulate Firebase locally
firebase emulators:start
```

---

## 🤖 AI Model Rotation Explained

The backend automatically tries providers in this order:

1. **Ollama** (if running locally)
   - Fastest, completely offline
   - No API key needed
   - Download: https://ollama.ai
   - Model: `llama3.1:70b`

2. **LM Studio** (if running locally)
   - User-friendly GUI
   - No API key needed
   - Download: https://lmstudio.ai
   - Model: `qwen2.5-7b-instruct` (configurable)

3. **Groq** (free cloud)
   - High quality, very fast
   - API key: https://console.groq.com/keys
   - Free tier: ~2 requests/min
   - Model: `mixtral-8x7b-32768`

4. **Together.ai** (free cloud)
   - Good quality, reasonable rate limits
   - API key: https://api.together.xyz/settings/api-keys
   - Free tier: 1M tokens/month
   - Model: `meta-llama/Llama-3-70b-chat-hf`

**If all providers fail**, the API returns a 503 error with clear instructions.

---

## 📊 Firebase Realtime Database Structure

```json
{
  "bookings": {
    "BK-abc123": {
      "id": "BK-abc123",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "(812) 555-0000",
      "service": "Computer Repair",
      "date": "2025-03-20",
      "time": "14:00",
      "status": "new",
      "created": "2025-03-14T10:00:00.000Z"
    }
  },
  "leads": {
    "LD-xyz789": {
      "id": "LD-xyz789",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "message": "Need network setup",
      "status": "new",
      "created": "2025-03-14T09:30:00.000Z"
    }
  },
  "conversations": {
    "1710414000000": {
      "context": "customer",
      "provider": "ollama",
      "model": "llama3.1:70b",
      "user": "What do you charge for virus removal?",
      "ai": "We offer virus removal starting at $35/hr for remote support...",
      "created": "2025-03-14T10:00:00.000Z"
    }
  },
  "customers": {...},
  "tickets": {...},
  "invoices": {...}
}
```

---

## 🔐 Security & Best Practices

### Backend Security
- ✅ Environment variables (no hardcoded secrets)
- ✅ CORS configured (adjust as needed)
- ✅ Firebase Admin Auth (prevents unauthorized writes)
- ✅ Input validation on all endpoints

### Firebase Database Rules
- ✅ Read/Write disabled by default
- ✅ Admin-only access for sensitive data
- ✅ Validation rules for each collection
- ✅ Rules are in `database.rules.json`

### API Key Management
```bash
# NEVER commit .env file
echo ".env" >> .gitignore
echo "*.env" >> .gitignore

# Use environment variables in production
# Set in:
# - Cloud Run: Environment variables tab
# - Vercel: Settings > Environment Variables
# - Firebase Functions: set via CLI
```

---

## 📱 Frontend Components

| Component | Purpose |
|-----------|---------|
| `ChatWidget.jsx` | AI chat interface (customer & admin) |
| `BookingForm.jsx` | Appointment scheduling |
| `ServicesShowcase.jsx` | Display 200+ services |
| `AdminDashboard.jsx` | View bookings, leads, stats |
| `App.jsx` | Main app router & layout |

---

## 🛠️ Troubleshooting

### Backend won't connect to Firebase
```bash
# Check credentials
echo $GOOGLE_APPLICATION_CREDENTIALS

# Should output valid JSON, not empty
# If empty, copy from Firebase Console > Service Accounts
```

### AI providers failing
```bash
# Check health endpoint
curl http://localhost:3000/health

# Should show which providers are configured
# If all fail, check .env variables
```

### Firebase Hosting deployment fails
```bash
# Check if you're logged in
firebase login

# Check project selection
firebase projects:list

# Verify firebase.json exists
cat firebase.json

# Try deploying with verbose output
firebase deploy --only hosting -v
```

### Port 3000 already in use
```bash
# Find and kill process using port 3000
lsof -i :3000

# Or use a different port
PORT=3001 npm run dev
```

---

## 📈 Performance Tips

### Frontend
- ✅ Use Vite (instant HMR, fast builds)
- ✅ Code splitting via dynamic imports
- ✅ Cache static assets (24+ hours)
- ✅ Lazy load components

### Backend
- ✅ Connection pooling to Firebase
- ✅ Cache AI responses (optional)
- ✅ Use local models when possible
- ✅ Fallback chain ensures availability

### Database
- ✅ Index frequently queried fields
- ✅ Denormalize data where appropriate
- ✅ Archive old conversations
- ✅ Monitor usage in Firebase Console

---

## 📞 Support

**Gary's Contact:**
- 📱 Phone: (812) 373-6023
- 📧 Email: gary.amick0614@gmail.com
- 💬 Chat: Use the website's built-in chat
- 🕐 Hours: 24/7 available

---

## 📝 Changelog

### v1.0.0 (2025-03-14)
- ✅ Initial release
- ✅ AI model rotation (Ollama, LM Studio, Groq, Together.ai)
- ✅ Firebase Realtime Database integration
- ✅ React frontend with Vite
- ✅ Express backend
- ✅ Admin dashboard
- ✅ Booking & contact forms
- ✅ Chat widget
- ✅ 200+ services showcase
- ✅ Zero Netlify/paid services

---

## 📄 License

© 2026 Gary Amick - That Computer Guy. All rights reserved.

**Author:** Gary Amick  
**Business:** That Computer Guy  
**Location:** Seymour, Indiana  
**Phone:** (812) 373-6023

---

## 🎯 Next Steps

1. **Get Firebase credentials:** Firebase Console > Service Accounts
2. **Set up local AI:** Install Ollama or LM Studio
3. **Configure .env:** Copy template and fill in values
4. **Start backend:** `npm run dev`
5. **Start frontend:** `npm run dev` (in another terminal)
6. **Deploy:** `firebase deploy --only hosting`
7. **Monitor:** Firebase Console > Analytics & Realtime Database

---

**Last Updated:** 2025-03-14  
**Status:** Production Ready ✅
