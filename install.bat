@echo off
REM ============================================================
REM TCG WEBSITE v2.0 - ONE-CLICK INSTALLER FOR WINDOWS
REM ============================================================

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║        🚀 TCG WEBSITE v2.0 - WINDOWS INSTALLER 🚀            ║
echo ║                                                                ║
echo ║  This script will install and setup your complete             ║
echo ║  enterprise system in just a few minutes!                     ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM ── STEP 1: CHECK PREREQUISITES ──
echo [1/7] Checking prerequisites...
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed
    echo Install from: https://nodejs.org
    pause
    exit /b 1
)
echo ✓ Node.js found

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ NPM is not installed
    pause
    exit /b 1
)
echo ✓ NPM found

where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Git is not installed
    echo Install from: https://git-scm.com
    pause
    exit /b 1
)
echo ✓ Git found

echo.

REM ── STEP 2: SETUP PROJECT ──
echo [2/7] Setting up project...

if not exist "tcg-website-firebase" (
    mkdir tcg-website-firebase
)

cd tcg-website-firebase

REM ── STEP 3: INSTALL DEPENDENCIES ──
echo [3/7] Installing dependencies (this may take a minute)...

if not exist "node_modules" (
    call npm install
) else (
    echo ✓ Dependencies already installed
)

echo.

REM ── STEP 4: CREATE .ENV FILE ──
echo [4/7] Configuring environment...

if not exist ".env" (
    echo Creating .env file...
    (
        echo # TCG WEBSITE v2.0 - Auto-Generated Configuration
        echo # Generated: %date% %time%
        echo.
        echo PORT=3000
        echo.
        echo FIREBASE_DB_URL=https://babysitter-b322c-default-rtdb.firebaseio.com
        echo FIREBASE_API_KEY=
        echo FIREBASE_PROJECT_ID=babysitter-b322c
        echo GOOGLE_APPLICATION_CREDENTIALS=
        echo.
        echo EMAIL_SERVICE=gmail
        echo EMAIL_USER=
        echo EMAIL_PASS=
        echo EMAIL_FROM=That Computer Guy ^<gary.amick0614@gmail.com^>
        echo.
        echo TWILIO_ACCOUNT_SID=
        echo TWILIO_AUTH_TOKEN=
        echo TWILIO_PHONE_NUMBER=
        echo.
        echo STRIPE_SECRET_KEY=
        echo STRIPE_PUBLISHABLE_KEY=
        echo STRIPE_WEBHOOK_SECRET=
        echo.
        echo OLLAMA_URL=http://localhost:11434
        echo LMSTUDIO_URL=http://localhost:1234
        echo GROQ_API_KEY=
        echo TOGETHER_API_KEY=
    ) > .env
    
    echo ✓ .env file created
    echo ⚠ Important: Edit .env with your credentials
) else (
    echo ✓ .env file already exists
)

echo.

REM ── STEP 5: BUILD FRONTEND ──
echo [5/7] Building frontend...

call npm run build

echo.

REM ── STEP 6: CREATE BATCH FILES ──
echo [6/7] Creating helper scripts...

REM Create start.bat
(
    echo @echo off
    echo echo.
    echo echo ╔════════════════════════════════════════════════════════════════╗
    echo echo ║                                                                ║
    echo echo ║              🚀 TCG Website v2.0 Starting... 🚀               ║
    echo echo ║                                                                ║
    echo echo ╚════════════════════════════════════════════════════════════════╝
    echo echo.
    echo.
    echo if not exist ".env" (
    echo     echo ❌ .env file not found!
    echo     pause
    echo     exit /b 1
    echo )
    echo.
    echo echo Starting backend ^(port 3000^)...
    echo start cmd /k npm run dev
    echo.
    echo timeout /t 3 /nobreak
    echo.
    echo echo Starting frontend ^(port 5000^)...
    echo call npm run build ^>nul 2^>nul
    echo start cmd /k firebase serve --only hosting
    echo.
    echo echo.
    echo echo ╔════════════════════════════════════════════════════════════════╗
    echo echo ║                   🎉 SYSTEM STARTED! 🎉                       ║
    echo echo ╠════════════════════════════════════════════════════════════════╣
    echo echo ║                                                                ║
    echo echo ║  Website:     http://localhost:5000                          ║
    echo echo ║  Backend API: http://localhost:3000                          ║
    echo echo ║  Admin:       http://localhost:5000/admin                    ║
    echo echo ║                                                                ║
    echo echo ║  Close windows above to stop                                  ║
    echo echo ║                                                                ║
    echo echo ╚════════════════════════════════════════════════════════════════╝
) > start.bat

echo ✓ start.bat created

REM Create deploy.bat
(
    echo @echo off
    echo echo.
    echo echo ╔════════════════════════════════════════════════════════════════╗
    echo echo ║                                                                ║
    echo echo ║          🚀 Deploying to Firebase Hosting... 🚀               ║
    echo echo ║                                                                ║
    echo echo ╚════════════════════════════════════════════════════════════════╝
    echo echo.
    echo.
    echo where firebase ^>nul 2^>nul
    echo if errorlevel 1 (
    echo     echo ❌ Firebase CLI not installed
    echo     echo Install with: npm install -g firebase-tools
    echo     pause
    echo     exit /b 1
    echo )
    echo.
    echo echo Building application...
    echo call npm run build
    echo.
    echo echo Deploying to Firebase...
    echo call firebase deploy --only hosting
    echo.
    echo echo ✅ Deployment complete!
    echo pause
) > deploy.bat

echo ✓ deploy.bat created

REM Create edit-env.bat
(
    echo @echo off
    echo notepad .env
) > edit-env.bat

echo ✓ edit-env.bat created

echo.

REM ── STEP 7: SUMMARY ──
echo [7/7] Installation complete!

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                  ✅ SETUP COMPLETE! ✅                        ║
echo ╠════════════════════════════════════════════════════════════════╣
echo ║                                                                ║
echo ║  Quick start:                                                  ║
echo ║                                                                ║
echo ║  1. Configure your system:                                     ║
echo ║     Double-click: edit-env.bat                                 ║
echo ║     (Add Firebase, email, and SMS credentials)                 ║
echo ║                                                                ║
echo ║  2. Start development:                                         ║
echo ║     Double-click: start.bat                                    ║
echo ║     (Opens http://localhost:5000)                              ║
echo ║                                                                ║
echo ║  3. Deploy to production:                                      ║
echo ║     Double-click: deploy.bat                                   ║
echo ║     (Goes live at https://babysitter-b322c.web.app)           ║
echo ║                                                                ║
echo ║  Questions? Call Gary: (812) 373-6023                          ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝

pause
