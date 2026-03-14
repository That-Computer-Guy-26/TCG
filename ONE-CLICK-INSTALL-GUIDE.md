# 🚀 TCG WEBSITE v2.0 - ONE-CLICK INSTALLATION GUIDE

## Overview

This guide covers all methods to get your TCG system running with minimal effort:

1. **Windows** - Double-click to install
2. **Mac/Linux** - One command to install
3. **Docker** - Containerized deployment
4. **Cloud** - Firebase Hosting + Cloud Run

---

## ⚡ FASTEST: 60-SECOND SETUP

### Windows Users
```
1. Double-click: install.bat
2. Double-click: edit-env.bat (add your credentials)
3. Double-click: start.bat
4. Visit: http://localhost:5000
```

### Mac/Linux Users
```bash
chmod +x install.sh
./install.sh
./start.sh
# Visit: http://localhost:5000
```

---

## 📋 OPTION 1: WINDOWS ONE-CLICK

### What You Get
- Automatic dependency checking
- Auto-generated configuration
- Helper batch files for common tasks
- No command line needed

### Steps

1. **Extract the ZIP file**
   - Right-click `tcg-website-firebase-v2.0-COMPLETE-ENTERPRISE.zip`
   - Select "Extract All"
   - Choose a folder location

2. **Run the installer**
   - Double-click `install.bat`
   - Wait for "Setup Complete" message
   - Press any key to continue

3. **Configure your system**
   - Double-click `edit-env.bat`
   - Notepad opens with configuration
   - Add your Firebase credentials:
     ```
     FIREBASE_DB_URL=https://babysitter-b322c-default-rtdb.firebaseio.com
     EMAIL_USER=your-email@gmail.com
     EMAIL_PASS=your-app-password
     ```
   - Save (Ctrl+S)
   - Close

4. **Start the system**
   - Double-click `start.bat`
   - Two console windows open
   - Wait for "System Started" message
   - Visit: http://localhost:5000

5. **Login as admin**
   - Click "Admin" button
   - Password: (set in .env, default: tcg2025)
   - Explore all 10 dashboard pages!

### To Deploy to Production
- Double-click `deploy.bat`
- System goes live at: https://babysitter-b322c.web.app
- Done!

---

## 🍎 OPTION 2: MAC/LINUX ONE-CLICK

### Prerequisites
Check you have these installed:
```bash
# Check Node.js
node --version  # Should be 18+

# Check NPM
npm --version

# Check Git
git --version
```

If any are missing, install from:
- Node.js: https://nodejs.org
- Git: https://git-scm.com

### Setup (Two Commands)

```bash
# 1. Make installer executable
chmod +x install.sh

# 2. Run installer
./install.sh
```

That's it! The script will:
- ✅ Check all dependencies
- ✅ Install npm packages
- ✅ Create .env file
- ✅ Build the frontend
- ✅ Create helper scripts

### Configure Your System

```bash
# Edit configuration
nano .env
```

Update these fields:
```
FIREBASE_DB_URL=https://babysitter-b322c-default-rtdb.firebaseio.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

Save (Ctrl+X, Y, Enter)

### Start the System

```bash
./start.sh
```

Visit: http://localhost:5000

### Deploy to Production

```bash
./deploy.sh
```

Site goes live at: https://babysitter-b322c.web.app

---

## 🐳 OPTION 3: DOCKER ONE-CLICK

### Prerequisites
- Docker Desktop installed
  - Mac/Windows: https://www.docker.com/products/docker-desktop
  - Linux: https://docs.docker.com/engine/install/

### Installation

```bash
# 1. Make installer executable
chmod +x docker-install.sh

# 2. Run Docker installer
./docker-install.sh
```

That's it! Entire system runs in containers:
- Frontend container (port 5000)
- Backend container (port 3000)
- Isolated, clean, reproducible

### Access Your System

- Frontend: http://localhost:5000
- Backend API: http://localhost:3000
- Admin Dashboard: http://localhost:5000/admin

### Stop the System

```bash
# Just press Ctrl+C in the terminal
```

### Redeploy

```bash
./docker-install.sh
```

---

## ☁️ OPTION 4: CLOUD DEPLOYMENT (ONE-CLICK)

### Prerequisites
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Install Google Cloud CLI
# Download from: https://cloud.google.com/sdk/docs/install

# Setup credentials
firebase login
gcloud auth login
```

### Deployment

```bash
# Make script executable
chmod +x deploy-cloud.sh

# Run cloud deployment
./deploy-cloud.sh
```

Follow the prompts:
1. Choose deployment option (Frontend only or Frontend + Backend)
2. System automatically builds and deploys
3. Gets live URL for your site

### Deployment Options

**Option 1: Firebase Hosting Only**
- Frontend only
- Auto-scaling
- Free tier
- Live at: https://babysitter-b322c.web.app

**Option 2: Firebase + Cloud Run**
- Frontend on Firebase Hosting
- Backend on Cloud Run (serverless)
- Auto-scales to zero
- Costs $0 when idle

**Option 3: Docker Compose**
- Runs locally in containers
- Perfect for testing before production
- Easy to customize

---

## 🎯 QUICK REFERENCE

### Windows
```
Extract ZIP → Double-click install.bat → Configure → Double-click start.bat
```

### Mac/Linux
```
chmod +x install.sh && ./install.sh && ./start.sh
```

### Docker
```
chmod +x docker-install.sh && ./docker-install.sh
```

### Cloud
```
chmod +x deploy-cloud.sh && ./deploy-cloud.sh
```

---

## ⚙️ CONFIGURATION REFERENCE

### Essential Settings (.env file)

```bash
# Firebase (Required)
FIREBASE_DB_URL=https://babysitter-b322c-default-rtdb.firebaseio.com
FIREBASE_PROJECT_ID=babysitter-b322c

# Email (Required for notifications)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password  # See below for setup

# SMS (Optional but recommended)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Payments (Optional)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AI Models
OLLAMA_URL=http://localhost:11434  # Local (offline)
GROQ_API_KEY=your-groq-key  # Cloud backup
```

### How to Get Credentials

#### Firebase
1. Go to https://console.firebase.google.com
2. Select "babysitter-b322c" project
3. Go to Project Settings
4. Copy database URL

#### Gmail App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select Mail + Windows Computer (or your device)
3. Copy the 16-character password
4. Paste into EMAIL_PASS

#### Twilio (Optional)
1. Sign up: https://www.twilio.com/console
2. Get Account SID and Auth Token
3. Get a phone number
4. Add to .env

#### Groq (Optional, free)
1. Sign up: https://console.groq.com
2. Get API key
3. Add to GROQ_API_KEY

---

## 🚀 WHAT HAPPENS AFTER INSTALLATION

### Local Development (http://localhost:5000)
- Full admin dashboard access
- Real-time data sync
- Chat with AI
- Test all features
- No internet needed (except AI)

### Firebase Deployment (https://babysitter-b322c.web.app)
- Live website
- All systems active
- Real payment processing
- Email/SMS alerts
- 99.9% uptime SLA

---

## 🆘 TROUBLESHOOTING

### Windows - "Command not found"
```
Solution: Make sure Node.js is installed from nodejs.org
Restart your computer after installation
```

### Mac/Linux - Permission denied
```bash
chmod +x *.sh
./install.sh
```

### Docker - "Docker daemon not running"
```
Solution: Start Docker Desktop
Make sure it's running before executing docker-install.sh
```

### Port already in use
```bash
# Port 3000 in use?
PORT=3001 npm run dev

# Port 5000 in use?
npm run build
firebase serve --only hosting -p 5001
```

### Firebase credentials not working
```
1. Check .env file has correct database URL
2. Verify GOOGLE_APPLICATION_CREDENTIALS
3. Try: firebase login
```

---

## 📊 INSTALLATION METHODS COMPARISON

| Method | Time | Ease | Cost | Scalability |
|--------|------|------|------|-------------|
| Windows Batch | 2 min | ⭐⭐⭐⭐⭐ | $0 | Small |
| Mac/Linux Bash | 3 min | ⭐⭐⭐⭐⭐ | $0 | Small |
| Docker | 5 min | ⭐⭐⭐⭐⭐ | $0 | Medium |
| Cloud Deploy | 5 min | ⭐⭐⭐⭐ | $0-10 | Large |

---

## ✨ RECOMMENDED SETUP

### For Development
```
→ Use Windows/Mac installer
→ Run locally
→ Test features
→ Deploy when ready
```

### For Small Business
```
→ Use Windows/Mac installer
→ Deploy to Firebase Hosting
→ Costs: $0-10/month
→ Perfect for up to 100 users
```

### For Growth
```
→ Use Docker locally
→ Deploy to Cloud Run
→ Add mobile app
→ Costs: $0-50/month
→ Scales to 1000+ users
```

### For Production Enterprise
```
→ Setup GitHub Actions CI/CD
→ Deploy backend to Cloud Run
→ Setup custom domain
→ Monitor with Firebase Console
→ Costs: $0-100/month
→ Full 99.9% SLA
```

---

## 🎓 NEXT STEPS AFTER INSTALLATION

1. **Login to admin dashboard**
   - Click "Admin" on home page
   - Use default password

2. **Explore all 10 pages**
   - Overview, Bookings, Leads
   - Invoicing, Scheduling, CRM
   - Reports, Time Tracking, Inventory
   - Chat

3. **Configure your business**
   - Edit .env with your info
   - Add your services
   - Setup email/SMS alerts

4. **Test key features**
   - Create a test booking
   - Send an invoice
   - Chat with AI
   - Check reports

5. **Deploy to production**
   - Run deploy script
   - Site goes live
   - Tell your customers!

---

## 📞 SUPPORT

- **Phone**: (812) 373-6023
- **Email**: gary.amick0614@gmail.com
- **Hours**: 24/7 available

---

## ✅ INSTALLATION CHECKLIST

### Before Starting
- [ ] Node.js 18+ installed
- [ ] Have Firebase credentials ready
- [ ] Have email credentials ready (optional: SMS, Stripe)

### Installation (Choose One)
- [ ] Windows: `install.bat` method
- [ ] Mac/Linux: `install.sh` method
- [ ] Docker: `docker-install.sh` method
- [ ] Cloud: `deploy-cloud.sh` method

### After Installation
- [ ] .env file configured
- [ ] System starting without errors
- [ ] Can access http://localhost:5000
- [ ] Can login to admin
- [ ] Can see all dashboard pages

### Ready for Production
- [ ] Tested all features locally
- [ ] Firebase credentials verified
- [ ] Email/SMS configured (if needed)
- [ ] Run deploy script
- [ ] System live at https://babysitter-b322c.web.app

---

**Choose your installation method above and get started in minutes!**

**Your complete enterprise system is ready to deploy!** 🚀
