@echo off
echo Starting Betting Suite...
echo.
echo Building the project...
call npm run build
echo.
echo Starting local server...
echo.
echo Your website will open at: http://localhost:3000
echo.
echo To stop the server, close this window or press Ctrl+C
echo.
start http://localhost:3000
npx serve dist -p 3000
pause