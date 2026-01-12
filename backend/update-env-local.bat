@echo off
echo ============================================
echo FIX DNS ISSUE - UPDATE .env FOR LOCAL MONGODB
echo ============================================
echo.

cd /d "%~dp0"

echo Current directory: %CD%
echo.

if exist ".env" (
    echo Found .env file
    echo.
    echo Creating backup...
    copy .env .env.backup.%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2% >nul 2>&1
    echo Backup created: .env.backup.*
    echo.
) else (
    echo No .env file found. Creating new one...
    echo.
)

echo Creating new .env with local MongoDB...
echo.

(
echo # MongoDB - Local ^(No DNS issues!^)
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
echo # Redis ^(optional - leave empty^)
echo REDIS_HOST=
echo REDIS_PORT=
echo REDIS_PASSWORD=
echo.
echo # Cloudinary ^(optional^)
echo CLOUDINARY_CLOUD_NAME=
echo CLOUDINARY_API_KEY=
echo CLOUDINARY_API_SECRET=
echo.
echo # WhatsApp ^(optional^)
echo WHATSAPP_PHONE_NUMBER_ID=
echo WHATSAPP_ACCESS_TOKEN=
echo WHATSAPP_VERIFY_TOKEN=
echo WHATSAPP_BUSINESS_ACCOUNT_ID=
) > .env

echo ============================================
echo ✅ .env FILE UPDATED!
echo ============================================
echo.
echo New MongoDB URI: mongodb://localhost:27017/dashboard
echo.
echo NEXT STEPS:
echo.
echo 1. Install MongoDB locally:
echo    - Run: install-local-mongodb.bat ^(as Administrator^)
echo    - OR download from: https://www.mongodb.com/try/download/community
echo.
echo 2. Start your server:
echo    npm run dev
echo.
echo 3. Done! No more DNS errors!
echo.
echo ============================================
pause
