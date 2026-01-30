@echo off
echo ================================
echo Sikhiya Connect IP Updater
echo ================================
echo.

REM Get current IPv4 address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP=%%a
    goto :found
)

:found
REM Remove leading space
set IP=%IP:~1%
echo Current IP Address: %IP%
echo.

REM Update .env.local
echo Updating .env.local...
echo NEXT_PUBLIC_API_URL=http://%IP%:8000 > .env.local
echo ✓ Updated .env.local
echo.

REM Build the app
echo Building Next.js app...
call npm run build
if errorlevel 1 (
    echo ✗ Build failed!
    pause
    exit /b 1
)
echo ✓ Build successful
echo.

REM Sync to Android
echo Syncing to Android...
call npx cap sync android
if errorlevel 1 (
    echo ✗ Sync failed!
    pause
    exit /b 1
)
echo ✓ Sync successful
echo.

echo ================================
echo Update Complete!
echo ================================
echo.
echo Next steps:
echo 1. Open Android Studio
echo 2. Build APK (Build → Build APK)
echo 3. Install on your phone
echo.
echo Backend will use: http://%IP%:8000
echo.
pause
