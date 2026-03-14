# TCG Website - Apps Integration Guide

## 🚀 Apps Integration Overview

Your TCG website now includes an integrated **Apps Portal** that hosts embedded applications hosted directly from Firebase Hosting.

---

## 📱 Available Apps

### 1. **Nevaeh Family App v7.0** 💕
- **Path**: `/nevaeh-family-app.html`
- **Type**: Single-file HTML app (embedded)
- **Features**: Family management, financial tracking, events, member profiles
- **Access**: TCG Website → 🚀 Apps → Nevaeh Family App

---

## 🏗️ Architecture

```
Firebase Hosting (public/)
├── index.html                  (Vite entry - React app)
├── nevaeh-family-app.html      (Embedded app)
└── [other assets from dist/]

TCG React App
├── App.jsx (navigation)
├── HomeScreen
├── ServicesShowcase
├── ChatWidget
├── BookingForm
├── AdminDashboard
└── AppsPortal (NEW)
    └── iframe → /nevaeh-family-app.html
```

---

## 🔧 How It Works

### Frontend (React)
1. User clicks "🚀 Apps" in navigation
2. AppsPortal component renders app grid
3. User clicks an app card
4. App opens in full-screen iframe
5. `sandbox` attribute ensures security

### Static Files (Firebase)
- All apps stored in `/public/` folder
- Copied to `/dist/` during build
- Served directly by Firebase Hosting at `/appname.html`
- No additional backend needed

### Security
```html
<iframe 
  sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
/>
```
- Runs in isolated context
- Can't break out of iframe
- Allows same-origin (Firebase domain)
- Allows scripts & forms

---

## ➕ Adding More Apps

### Step 1: Add HTML File to `/public/`
```bash
cp your-app.html public/your-app.html
```

### Step 2: Add to Apps Array in `src/App.jsx`

```javascript
const apps = [
  {
    id: 'nevaeh',
    name: '💕 Nevaeh Family App',
    description: 'Family management dashboard',
    version: 'v7.0',
    url: '/nevaeh-family-app.html',
    category: 'Family',
    icon: '👨‍👩‍👧‍👦'
  },
  // ADD YOUR NEW APP HERE:
  {
    id: 'your-app',
    name: '🆕 Your App Name',
    description: 'Your app description',
    version: 'v1.0',
    url: '/your-app.html',
    category: 'Category',
    icon: '🎯'
  }
];
```

### Step 3: Deploy
```bash
npm run build
firebase deploy --only hosting
```

Your new app is now live! ✅

---

## 📁 File Structure

```
tcg-website-firebase/
├── public/                          ← Apps hosted here
│   ├── nevaeh-family-app.html      ← Nevaeh app
│   └── [add more apps here]
│
├── src/
│   ├── App.jsx                      ← Apps array defined here
│   ├── App.css
│   └── components/
│
├── vite.config.js                   ← copyPublicDir: true (important!)
├── firebase.json                    ← Hosting config
└── package.json
```

---

## 🚀 Deployment Checklist

### Local Testing
- [ ] App files copied to `/public/`
- [ ] Apps array updated in `App.jsx`
- [ ] Run `npm run dev`
- [ ] Test apps load in iframe
- [ ] Apps function correctly

### Firebase Deployment
- [ ] Run `npm run build`
- [ ] Verify `/dist/` contains public files
- [ ] Run `firebase deploy --only hosting`
- [ ] Visit https://babysitter-b322c.web.app/🚀-apps
- [ ] Click each app to verify

---

## 🔒 Security Notes

### What Runs Safely
- ✅ JavaScript in the app
- ✅ DOM manipulation within iframe
- ✅ Local storage within app domain
- ✅ Form submissions to same domain

### What's Blocked
- ❌ Breaking out of iframe
- ❌ Accessing parent window
- ❌ Cross-origin requests (unless CORS)
- ❌ Modifying host page

### Best Practices
```javascript
// Good: App uses REST API
fetch('/api/data')

// Good: App uses Firebase directly
fetch('https://babysitter-b322c-default-rtdb.firebaseio.com')

// Bad: App tries to access parent window
parent.location.href = '...'  // BLOCKED

// Bad: App tries to modify host
window.top.document.body.innerHTML = '...'  // BLOCKED
```

---

## 📊 URL Structure

### Development
```
http://localhost:5173/
http://localhost:5173/nevaeh-family-app.html
```

### Production
```
https://babysitter-b322c.web.app/
https://babysitter-b322c.web.app/nevaeh-family-app.html
```

Both work! The React app routes work via client-side routing, and static files work via Firebase Hosting.

---

## 🎯 Features

### Apps Portal UI
- **Grid Layout**: Shows all available apps
- **App Cards**: Icon, name, description, version
- **Full-Screen Mode**: Click to open app in full screen
- **Back Button**: Return to apps grid
- **Responsive**: Works on mobile & desktop

### App Integration
- **Isolated iframes**: Each app runs safely
- **No dependencies**: Apps are self-contained
- **No reload needed**: Apps persist data locally
- **Fast loading**: Apps served from CDN

---

## 🔗 Quick Links

### For Users
```
Home → 🚀 Apps → Select App → Open
```

### For Developers
```
public/             ← Add your app.html here
src/App.jsx         ← Add to apps[] array
npm run build       ← Build everything
firebase deploy     ← Deploy to production
```

---

## 📝 Example: Adding a Second App

### 1. Save your app HTML
```bash
cp my-super-tool.html public/my-super-tool.html
```

### 2. Update App.jsx
```javascript
const apps = [
  {
    id: 'nevaeh',
    name: '💕 Nevaeh Family App',
    description: 'Family management dashboard',
    version: 'v7.0',
    url: '/nevaeh-family-app.html',
    category: 'Family',
    icon: '👨‍👩‍👧‍👦'
  },
  {
    id: 'super-tool',
    name: '⚡ Super Tool',
    description: 'Your amazing app',
    version: 'v1.0',
    url: '/my-super-tool.html',
    category: 'Tools',
    icon: '⚡'
  }
];
```

### 3. Deploy
```bash
npm run build
firebase deploy --only hosting
```

### 4. Visit
```
https://babysitter-b322c.web.app → 🚀 Apps → ⚡ Super Tool
```

---

## ⚠️ Troubleshooting

### App doesn't load in iframe
```
1. Check file exists: /public/app-name.html
2. Check App.jsx has correct url: '/app-name.html'
3. Check firebase.json has publicDir: 'dist'
4. Check vite.config.js has copyPublicDir: true
5. Rebuild: npm run build
```

### App loads but is broken
```
1. Check app uses relative paths (not absolute)
2. Check app doesn't break out of iframe
3. Check app doesn't require special CORS headers
4. Check app uses same domain APIs
```

### Can't see app in grid
```
1. Verify app object in apps[] array
2. Verify all required fields (id, name, url, icon)
3. Rebuild and redeploy
4. Hard refresh browser (Ctrl+Shift+R)
```

---

## 📞 Support

For questions about app integration:
- Gary: (812) 373-6023
- Email: gary.amick0614@gmail.com

---

## ✅ Summary

✅ Apps hosted from Firebase (no extra cost)  
✅ Integrated into TCG website  
✅ Secure iframe isolation  
✅ Easy to add more apps  
✅ Works offline (apps are static files)  
✅ No Netlify dependencies  
✅ Fast CDN delivery  

Your TCG website is now an **integrated apps platform**! 🚀

---

**Last Updated**: 2025-03-14  
**Status**: Production Ready ✅
