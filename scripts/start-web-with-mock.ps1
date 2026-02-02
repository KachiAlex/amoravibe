<#
Start the Next.js web app with environment variables pointing at the local
identity verification mock. This script is a convenience helper for Windows
PowerShell users. It does NOT persist the env variables to disk.

Usage:
  powershell -ExecutionPolicy Bypass -File .\scripts\start-web-with-mock.ps1

#>

Write-Host "Starting web app with mock backend (IDENTITY_SERVICE_URL=http://localhost:4002)"

$env:NEXT_PUBLIC_IDENTITY_SERVICE_URL = 'http://localhost:4002'
$env:NEXT_PUBLIC_USE_REAL_BACKEND = 'true'
$env:NEXT_PUBLIC_ENABLE_REAL_TRUST = 'true'
$env:NEXT_PUBLIC_ENABLE_REAL_DISCOVER = 'false'
$env:NEXT_PUBLIC_ENABLE_REAL_ENGAGEMENT = 'false'
$env:NEXT_PUBLIC_ENABLE_REAL_MESSAGING = 'false'

Push-Location "apps/web"
Write-Host "Running: npm run dev (inside apps/web)"
npm run dev
Pop-Location
