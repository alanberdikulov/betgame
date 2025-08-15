@echo off
title Betting Suite Server
echo Starting Betting Suite...
echo.
cd /d "%~dp0"

REM Check if dist folder exists
if not exist "dist" (
    echo Building application...
    call npm run build
    if errorlevel 1 (
        echo Failed to build application!
        pause
        exit /b 1
    )
)

echo Starting local server...
echo The betting suite will open in your browser shortly.
echo.
echo To stop the server, close this window or press Ctrl+C
echo.

REM Start a simple HTTP server using Node.js
npx --yes serve -s dist -l 3000

pause
