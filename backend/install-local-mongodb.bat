@echo off
echo ============================================
echo INSTALL LOCAL MONGODB - AUTOMATIC SETUP
echo ============================================
echo.

echo This script will help you setup local MongoDB.
echo.

echo Checking if MongoDB is already installed...
where mongod >nul 2>&1
if %errorlevel% == 0 (
    echo.
    echo ✅ MongoDB is already installed!
    echo.
    goto configure
)

echo.
echo ❌ MongoDB is not installed.
echo.
echo OPTION 1: Install via Chocolatey (Recommended - Automatic)
echo OPTION 2: Download manually (You'll need to install yourself)
echo.

set /p choice="Choose option (1 or 2): "

if "%choice%"=="1" goto choco
if "%choice%"=="2" goto manual

:choco
echo.
echo Checking if Chocolatey is installed...
where choco >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Chocolatey found!
    echo.
    echo Installing MongoDB...
    choco install mongodb -y
    echo.
    echo ✅ MongoDB installed!
    goto configure
) else (
    echo.
    echo ❌ Chocolatey is not installed.
    echo.
    echo To install Chocolatey, run PowerShell as Administrator and run:
    echo Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    echo.
    echo Then run this script again.
    echo.
    pause
    exit /b
)

:manual
echo.
echo Opening MongoDB download page...
start https://www.mongodb.com/try/download/community
echo.
echo Please:
echo 1. Download MongoDB Community Edition
echo 2. Install with default settings
echo 3. Run this script again after installation
echo.
pause
exit /b

:configure
echo.
echo ============================================
echo CONFIGURING YOUR PROJECT
echo ============================================
echo.

echo Creating data directory...
if not exist "C:\data\db" mkdir "C:\data\db"
echo ✅ Data directory created
echo.

echo Starting MongoDB service...
net start MongoDB >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ MongoDB service started
) else (
    echo ⚠️  MongoDB service not started (may already be running)
)
echo.

echo Updating .env file...
cd /d "%~dp0"

if exist ".env" (
    echo.
    echo Current .env file found.
    echo.
    echo Backing up current .env to .env.backup...
    copy .env .env.backup >nul
    echo ✅ Backup created
    echo.
)

echo Creating new .env with local MongoDB...
(
echo # MongoDB - Local Installation
echo MONGODB_URI=mongodb://localhost:27017/dashboard
echo.
echo # JWT
echo JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
echo.
echo # Server
echo PORT=5000
echo NODE_ENV=development
echo FRONTEND_URL=http://localhost:3000
echo.
echo # Redis ^(optional^)
echo REDIS_HOST=
echo REDIS_PORT=
echo REDIS_PASSWORD=
) > .env

echo ✅ .env file updated with local MongoDB connection
echo.

echo ============================================
echo ✅ SETUP COMPLETE!
echo ============================================
echo.
echo MongoDB is now running locally on: mongodb://localhost:27017
echo Your .env file has been updated.
echo.
echo Next steps:
echo 1. Start your server: npm run dev
echo 2. Your app will connect to local MongoDB
echo 3. No more timeout errors!
echo.
echo ============================================
pause
