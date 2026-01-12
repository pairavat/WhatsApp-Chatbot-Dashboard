@echo off
echo ============================================
echo Starting Backend Server
echo ============================================
echo.

cd /d "%~dp0"

echo Checking Node version...
node --version
echo.

echo Checking npm version...
npm --version
echo.

echo Starting server with nodemon...
echo.

npm run dev
