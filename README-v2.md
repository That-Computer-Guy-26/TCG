# TCG Website v2.0 - Firebase Hosting with Integrated Apps

> **That Computer Guy 26** — Professional IT Support & AI Automation  
> **Owner:** Gary Amick | **Location:** Seymour, Indiana  
> **Phone:** (812) 373-6023

---

## 🎯 What's New in v2.0

✅ **Apps Portal** - Host embedded HTML apps  
✅ **Nevaeh Family App** - Integrated & ready to use  
✅ **Firebase Hosting Only** - Removed all Netlify references  
✅ **Public Folder Support** - Static files served directly  
✅ **iframe Isolation** - Secure app sandboxing  

---

## 📦 Project Overview

This is a **production-ready, zero-mock-data** website for That Computer Guy with:

- **Frontend:** React + Vite → Firebase Hosting (free tier)
- **Backend:** Express.js → Local Node.js or Cloud Run (free tier)
- **Database:** Firebase Realtime Database (your existing URL)
- **Apps:** Embedded HTML apps hosted directly from Firebase
- **AI Models:** Rotating providers (Ollama → LM Studio → Groq → Together.ai)
- **Zero Netlify:** All free-tier services only

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                   THAT COMPUTER GUY v2.0                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  FRONTEND (React + Vite)                                    │
│  ├─ Hosted on: Firebase Hosting (free)                      │
│  ├─ URL: https://babysitter-b322c.web.app                 │
│  ├─ Features: Chat, Services, Booking, Admin, Apps Portal  │
│  └─ Static Files: /public/*.html served directly           │
│                                                              │
│  APPS PORTAL                                                │
│  ├─ Nevaeh Family App (v7.0)                               │
│  ├─ More apps can be added (see APPS-INTEGRATION.md)       │
│  └─ Hosted from /public/ folder                            │
│                                                              │
│  API BACKEND (Express.js)                                   │
│  ├─ Option A: Local (your machine, port 3000)              │
│  ├─ Option B: Cloud Run (free tier, auto-scales)           │
│  └─ Endpoints: /api/ai-chat, /api/data/*, /api/contact    │
│                                                              │
│  DATABASE (Firebase Realtime DB)                            │
│  ├─ URL: https://babysitter-b322c-default-rtdb            │
│  │        .firebaseio.com                                   │
│  └─ Collections: customers, bookings, leads, conversations │
│                                                              │
│  AI PROVIDERS (Automatic Rotation)                          │
│  ├─ 1. Ollama (local, offline, fastest)                    │
│  ├─ 2. LM Studio (local, user-friendly)                    │
│  ├─ 3. Groq (free cloud, high quality)                     │
│  └─ 4. Together.ai (free cloud, backup)                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 📋 Prerequisites

### Required
- **Node.js** 18+ (https://nodejs.org)
- **Firebase CLI** (install: `npm install -g firebase-tools`)
- **Git** (for version control)

### Recommended (for best AI performance)
- **Ollama** (https://ollama.ai) — offline LLM, fastest
- **LM Studio** (https://lmstudio.ai) — easy local LLM
- **API Keys** (free tier):
  - Groq: https://console.groq.com/keys
  - Together.ai: https://api.together.xyz/settings/api-keys

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Setup & Install
```bash
# Extract and setup
cd tcg-website-firebase
cp .env.template .env

# Edit .env with your Firebase credentials
nano .env

# Install dependencies
npm install
```

### Step 2: Start Backend
```bash
npm run dev
# Runs on http://localhost:3000
```

### Step 3: Start Frontend (new terminal)
```bash
npm run build
firebase serve --only hosting
# Runs on http://localhost:5000
```

Visit: **http://localhost:5000**

---

## 🌐 Deployment to Production

### Step 1: Build
```bash
npm run build
```

### Step 2: Deploy to Firebase
```bash
firebase deploy --only hosting
```

### Step 3: Verify
Your site is live at: **https://babysitter-b322c.web.app**

---

## 📱 Apps Portal

### View Available Apps
1. Go to TCG website
2. Click "🚀 Apps" in navigation
3. See app grid with all available apps
4. Click app card to open in full screen

### Current Apps
- **Nevaeh Family App v7.0** 💕
  - Family management dashboard
  - Financial tracking
  - Event management
  - Member profiles

### Add More Apps (See APPS-INTEGRATION.md)
1. Copy app HTML to `/public/`
2. Add to apps array in `src/App.jsx`
3. Deploy: `npm run build && firebase deploy`

---

## 🎯 Key Features

### Customer Features
✅ Browse 200+ services  
✅ Chat with AI (real-time)  
✅ Book appointments  
✅ Submit contact form  
✅ View pricing  
✅ Access integrated apps  
✅ Mobile responsive  

### Admin Features
✅ Dashboard with stats  
✅ View all bookings  
✅ View all leads  
✅ Admin chat with agents  
✅ Real-time data sync  

### Developer Features
✅ Zero mock data (all real)  
✅ Well documented code  
✅ Docker ready  
✅ Hot reload (HMR)  
✅ Environment config  
✅ Apps integration  

---

## 🤖 AI Model Rotation

Your website **automatically rotates** between:

1. **Ollama** (local, offline, fastest)
   - Download: https://ollama.ai/download
   - `ollama pull llama3.1:70b`

2. **LM Studio** (local, user-friendly)
   - Download: https://lmstudio.ai
   - Works out of the box

3. **Groq** (free cloud API)
   - Signup: https://console.groq.com/keys
   - High quality, ~2 req/min free

4. **Together.ai** (free cloud API)
   - Signup: https://api.together.xyz
   - 1M tokens/month free

**If one fails, automatic fallback!** ✅

---

## 💾 Database Structure

```json
{
  "bookings/{id}": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "(812) 555-0000",
    "service": "Computer Repair",
    "status": "new"
  },
  "leads/{id}": {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "message": "Need help with network"
  },
  "conversations/{timestamp}": {
    "context": "customer",
    "provider": "ollama",
    "user": "What services?",
    "ai": "We offer..."
  },
  "customers/{id}": {...},
  "invoices/{id}": {...},
  "tickets/{id}": {...}
}
```

---

## 🔐 Security

✅ **Firebase Realtime Database** security rules  
✅ **Admin-only access** to sensitive data  
✅ **Environment variables** for secrets  
✅ **CORS configured** for production  
✅ **Input validation** on all endpoints  
✅ **iframe sandboxing** for apps  
✅ **Non-root Docker** user  

### Important
- Never commit `.env` file
- Never share Firebase credentials
- Change admin password: Update in `.env`
- Use HTTPS everywhere (Firebase does automatically)

---

## 📊 Performance

| Aspect | Performance |
|--------|-------------|
| **Frontend Build** | ~2-5 seconds (Vite) |
| **Frontend HMR** | ~100ms (instant reload) |
| **Backend Startup** | ~3-5 seconds |
| **AI Response** | 2-10s (local) or 1-5s (cloud) |
| **Database Write** | ~50-200ms |
| **Firebase CDN** | ~20-50ms (global) |

---

## 💰 Monthly Costs

| Service | Cost | Notes |
|---------|------|-------|
| Firebase Hosting | **$0** | Free tier covers production |
| Firebase Realtime DB | **$0** | 100 concurrent users free |
| Cloud Run | **$0** | Free tier scales to zero |
| AI Models | **$0** | Ollama + free cloud APIs |
| **TOTAL** | **$0** | ✅ Completely Free |

---

## 📁 File Structure

```
tcg-website-firebase/
│
├─ 🖥️  BACKEND
│   ├─ server.mjs                Express with AI rotation
│   ├─ package.json              Dependencies
│   └─ .env.template             Environment setup
│
├─ 🎨 FRONTEND
│   ├─ index.html               Vite entry
│   ├─ vite.config.js           Build config
│   ├─ package.json             Dependencies (copy from package-frontend.json)
│   └─ src/
│       ├─ main.jsx             React entry
│       ├─ App.jsx              Main component + AppsPortal
│       ├─ App.css              Styles
│       └─ components/
│           ├─ ChatWidget.jsx
│           ├─ BookingForm.jsx
│           ├─ ServicesShowcase.jsx
│           └─ AdminDashboard.jsx
│
├─ 📱 APPS
│   └─ public/
│       └─ nevaeh-family-app.html   ← Your Nevaeh app
│                                    ← Add more apps here
│
├─ 🔥 FIREBASE CONFIG
│   ├─ firebase.json             Hosting setup
│   └─ database.rules.json       Security rules
│
├─ 🐳 DEPLOYMENT
│   ├─ Dockerfile               Cloud Run
│   └─ docker-compose.yml       Local stack
│
├─ 🚀 SCRIPTS
│   ├─ deploy.sh               Firebase deploy
│   ├─ dev.sh                  Local dev startup
│   └─ .gitignore              Git config
│
└─ 📚 DOCUMENTATION
    ├─ README.md                    Full guide (this file)
    ├─ QUICKSTART.md                Quick setup
    ├─ DEPLOYMENT-SUMMARY.md        Architecture
    ├─ APPS-INTEGRATION.md          Apps hosting guide
    └─ Other .md files
```

---

## ⚡ Quick Commands

```bash
# Development
npm install
npm run dev                    # Start backend
npm run build                  # Build frontend
firebase serve --only hosting  # Serve locally

# Deployment
firebase deploy --only hosting # Deploy to production

# Testing
curl http://localhost:3000/health
curl -X POST http://localhost:3000/api/ai-chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hi!","context":"customer"}'
```

---

## 🆘 Troubleshooting

### Backend won't start
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Firebase credentials error
```bash
# Verify .env has JSON value
cat .env | grep GOOGLE_APPLICATION_CREDENTIALS
# Should be long JSON string, not empty
```

### Apps not loading
```bash
# Check public folder
ls -la public/

# Verify vite.config.js has:
publicDir: 'public',
copyPublicDir: true,

# Rebuild
npm run build
```

### Port 3000 in use
```bash
PORT=3001 npm run dev
```

---

## 📞 Support & Contacts

**Gary's Information:**
- **Phone:** (812) 373-6023
- **Email:** gary.amick0614@gmail.com
- **Business:** That Computer Guy
- **Location:** Seymour, Indiana
- **Hours:** 24/7 available

---

## 📚 Documentation

| Document | Purpose | Read Time |
|----------|---------|-----------|
| **README.md** | This file - Full overview | 20 min |
| **QUICKSTART.md** | Get running in 5 minutes | 5 min |
| **APPS-INTEGRATION.md** | Add/manage embedded apps | 10 min |
| **DEPLOYMENT-SUMMARY.md** | Architecture details | 15 min |
| **Code comments** | In-file documentation | 20 min |

---

## ✅ Pre-Deployment Checklist

- [ ] Node.js 18+ installed
- [ ] Firebase CLI installed
- [ ] `.env` file configured
- [ ] Firebase credentials added
- [ ] Backend starts: `npm run dev`
- [ ] Frontend builds: `npm run build`
- [ ] Can open http://localhost:3000/health
- [ ] Chat endpoint works
- [ ] Booking form saves to Firebase
- [ ] Apps portal loads
- [ ] All apps functional in iframe
- [ ] Ready to deploy: `firebase deploy`

---

## 🎉 What You Have Now

✅ Complete React frontend  
✅ Express backend with AI rotation  
✅ Firebase integration ready  
✅ Apps portal with Nevaeh app  
✅ Docker deployment ready  
✅ Admin dashboard  
✅ Full documentation  
✅ Deployment scripts  
✅ Security best practices  
✅ Zero vendor lock-in  
✅ Zero cost infrastructure  
✅ Production ready  

---

## 🚀 Next Steps

1. **Setup** - Follow QUICKSTART.md
2. **Test** - Try locally
3. **Deploy** - Go live on Firebase
4. **Apps** - Add more apps (see APPS-INTEGRATION.md)
5. **Scale** - Add more features as needed

---

## 📝 Version History

### v2.0 (2025-03-14) - Apps Edition
- ✅ Added Apps Portal
- ✅ Integrated Nevaeh Family App
- ✅ Removed all Netlify references
- ✅ Firebase Hosting only
- ✅ Static file serving from /public/

### v1.0 (2025-03-14) - Firebase Edition
- ✅ React + Vite frontend
- ✅ Express backend with AI rotation
- ✅ Firebase Realtime Database
- ✅ Admin dashboard
- ✅ Chat widget
- ✅ Booking system

---

## 📄 License

© 2026 Gary Amick - That Computer Guy  
All rights reserved

---

**Status:** ✅ **Production Ready**  
**Last Updated:** 2025-03-14  
**Version:** 2.0 - Apps Edition  

🚀 **Ready to deploy!**
