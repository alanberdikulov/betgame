# Betting Suite Launcher
Write-Host "Starting Betting Suite..." -ForegroundColor Green
Write-Host ""

# Change to script directory
Set-Location $PSScriptRoot

# Check if dist folder exists
if (-not (Test-Path "dist")) {
    Write-Host "Building application..." -ForegroundColor Yellow
    & npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to build application!" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host "Starting local server..." -ForegroundColor Green
Write-Host "The betting suite will open in your browser shortly." -ForegroundColor Cyan
Write-Host ""
Write-Host "To stop the server, close this window or press Ctrl+C" -ForegroundColor Yellow
Write-Host ""

# Start a simple HTTP server and open browser
Start-Process "http://localhost:3000" -ErrorAction SilentlyContinue
& npx --yes serve -s dist -l 3000
