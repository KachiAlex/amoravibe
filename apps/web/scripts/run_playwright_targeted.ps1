param(
  [string[]]$Specs = @()
)

# Move to apps/web root (script lives in apps/web/scripts)
$webRoot = Split-Path $PSScriptRoot -Parent
Set-Location $webRoot

$env:PLAYWRIGHT_BASE_URL = 'https://amoravibe-web-git-feat-dashboard-colors-kachianietie.vercel.app'
$env:PLAYWRIGHT_START_SERVER = '0'

$specArgs = $Specs -join ' '
Write-Host "Running Playwright specs: $specArgs"

try {
  & npx playwright test --workers=1 --reporter=list
  exit $LASTEXITCODE
} catch {
  Write-Error "Playwright run failed: $_"
  exit 1
}
Set-StrictMode -Version Latest
Set-Location 'd:\amoravibe\apps\web'
$env:PLAYWRIGHT_BASE_URL = 'http://localhost:4000'
$env:PLAYWRIGHT_START_SERVER = '0'
npx playwright test 'e2e/admin-dashboard.spec.ts' 'e2e/admin-flow.spec.ts' 'e2e/trust-snapshot-fallback.spec.ts' --workers=1 --reporter=list