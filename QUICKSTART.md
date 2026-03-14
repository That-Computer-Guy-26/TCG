# 🚀 TCG Website - Quick Start Guide

## ⚡ 5-Minute Setup (Local Development)

### Prerequisites
```bash
# Check if you have Node.js 18+
node --version

# If not, download from https://nodejs.org
```

### Step 1: Copy Environment Template
```bash
cp .env.template .env
```

### Step 2: Add Your Firebase Credentials

1. Go to **Firebase Console**: https://console.firebase.google.com/
2. Select project: **babysitter-b322c**
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Copy the entire JSON
6. Paste into `.env`:
```bash
GOOGLE_APPLICATION_CREDENTIALS='<paste-json-here>'
```

### Step 3: Start Backend
```bash
npm install
npm run dev
```

Visit: http://localhost:3000/health

### Step 4: Start Frontend (new terminal)
```bash
# Option A: If using separate frontend folder
cd frontend
npm install
npm run dev

# Option B: If combined
npm run build
firebase serve --only hosting
```

Visit: http://localhost:5173 or http://localhost:5000

---

## 🤖 Using Local AI (Recommended)

### Ollama (Easiest)

1. Download: https://ollama.ai/download
2. Run:
   ```bash
   ollama serve
   ```
3. In another terminal:
   ```bash
   ollama pull llama3.1:70b
   ```

Backend will automatically use it! ✅

### LM Studio (User-Friendly)

1. Download: https://lmstudio.ai
2. Launch the app
3. Download a model (e.g., Qwen 2.5 7B)
4. Click **"Start Server"**
5. Backend automatically detects on localhost:1234 ✅

---

## 🚀 Deploy to Production

### Firebase Hosting (Frontend)
```bash
npm run build
firebase deploy --only hosting
```

Your site is live at: **https://babysitter-b322c.web.app**

### Cloud Run (Backend)
```bash
gcloud builds submit --tag gcr.io/babysitter-b322c/tcg-backend
gcloud run deploy tcg-backend \
  --image gcr.io/babysitter-b322c/tcg-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

Update frontend's `VITE_API_URL` to your Cloud Run URL.

---

## 🧪 Test Everything

### Backend Health
```bash
curl http://localhost:3000/health
```

### AI Chat
```bash
curl -X POST http://localhost:3000/api/ai-chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello!","context":"customer"}'
```

### Create Booking
```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name":"John Doe",
    "email":"john@example.com",
    "phone":"(812) 555-0000",
    "service":"Computer Repair",
    "type":"booking"
  }'
```

### View Bookings in Firebase
```bash
curl http://localhost:3000/api/data/bookings
```

---

## 📋 Project Structure

```
tcg-website-firebase/
├── server.mjs                 # Express backend
├── package.json               # Backend dependencies
├── frontend-package.json      # Frontend dependencies
├── index.html                 # Vite entry point
├── vite.config.js            # Vite build config
├── src/
│   ├── main.jsx              # React entry
│   ├── App.jsx               # Main component
│   ├── App.css               # Styles
│   └── components/
│       ├── ChatWidget.jsx     # Chat interface
│       ├── BookingForm.jsx    # Booking form
│       ├── ServicesShowcase.jsx
│       └── AdminDashboard.jsx # Admin panel
├── firebase.json             # Firebase config
├── database.rules.json       # DB security rules
├── Dockerfile                # Container setup
├── docker-compose.yml        # Multi-container setup
├── .env.template             # Environment template
├── .gitignore               # Git ignore rules
├── deploy.sh                # Deploy script
├── dev.sh                   # Development startup
├── README.md                # Full documentation
└── QUICKSTART.md            # This file
```

---

## 🆘 Troubleshooting

### "Backend won't start"
```bash
# Check port 3000 is available
lsof -i :3000

# Use different port
PORT=3001 npm run dev
```

### "Firebase credentials not found"
```bash
# Verify .env file has GOOGLE_APPLICATION_CREDENTIALS
cat .env | grep GOOGLE_APPLICATION_CREDENTIALS

# Should output JSON, not empty
```

### "AI providers not responding"
```bash
# Check health endpoint
curl http://localhost:3000/health

# Shows which providers are configured
# Make sure GROQ_API_KEY or TOGETHER_API_KEY is set
```

### "CORS errors from frontend"
```bash
# Update backend API URL in frontend/.env
VITE_API_URL=http://localhost:3000

# Or in development, the proxy in vite.config.js should work
```

---

## 📱 Test the Website

1. **Home Page**: All services listed
2. **Chat**: Try asking about services
3. **Book Service**: Fill form (saves to Firebase)
4. **Admin Dashboard**: Login with `tcg2026admin`
   - View all bookings
   - View all leads
   - See chat conversations
   - Real-time stats

---

## 🔑 Key URLs

| Service | URL | Status |
|---------|-----|--------|
| Frontend (Dev) | http://localhost:5173 | 🟢 Local |
| Backend API | http://localhost:3000 | 🟢 Local |
| Firebase DB | https://babysitter-b322c-default-rtdb.firebaseio.com | 🌐 Cloud |
| Firebase Hosting | https://babysitter-b322c.web.app | 🌐 Cloud |
| Cloud Run | https://tcg-backend-*.run.app | 🌐 Cloud |

---

## 📞 Need Help?

- **Gary's Phone**: (812) 373-6023
- **Email**: gary.amick0614@gmail.com
- **Chat**: Use the website's chat widget
- **Issues**: Check the full README.md

---

## ✅ Success Checklist

- [ ] Node.js 18+ installed
- [ ] Firebase CLI installed
- [ ] .env file configured with credentials
- [ ] Backend running on http://localhost:3000
- [ ] Frontend running on http://localhost:5173
- [ ] Can make POST to /api/ai-chat
- [ ] Ollama or LM Studio running (optional but recommended)
- [ ] Bookings saved to Firebase
- [ ] Admin dashboard accessible

---

**Ready? Start with:**
```bash
npm install
npm run dev
```

Then in another terminal:
```bash
cd frontend
npm install
npm run dev
```

That's it! 🎉

---

**Last Updated:** 2025-03-14  
**Status:** Ready to Deploy ✅
