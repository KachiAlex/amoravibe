# Ensure dev server is running on port 4000, wait until ready, then run Playwright against it
$port = 4000
$log = 'D:\amoravibe\dev_log.txt'
$err = 'D:\amoravibe\dev_log_err.txt'

# Kill any owner of the port
try {
  $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
  $owner = $conn.OwningProcess
} catch {
  $owner = $null
}
if ($owner) {
  Write-Output "Killing PID $owner"
  Stop-Process -Id $owner -Force -ErrorAction SilentlyContinue
} else {
  Write-Output "No process on port $port"
}

# Start dev server in background (writes logs to files)
Write-Output 'Starting Next dev in background...'
Start-Process -FilePath npm -ArgumentList 'run','dev' -WorkingDirectory 'D:\amoravibe\apps\web' -RedirectStandardOutput $log -RedirectStandardError $err -WindowStyle Minimized

# Wait until /dashboard returns 200 or timeout
$ready = $false
for ($i=0; $i -lt 90; $i++) {
  try {
    $code = & curl.exe -s -o NUL -w '%{http_code}' http://localhost:4000/dashboard
  } catch {
    $code = '000'
  }
  Write-Output "attempt $i -> $code"
  if ($code -eq '200') { $ready = $true; Write-Output 'Server ready'; break }
  Start-Sleep -Seconds 1
}

Write-Output '--- dev_log tail ---'
if (Test-Path $log) { Get-Content $log -Tail 80 } else { Write-Output 'dev_log.txt missing' }

if (-not $ready) {
  Write-Output 'Server did not become ready; aborting Playwright run'; exit 1
}

# Seed e2e data before running tests
Write-Output 'Seeding e2e data via API...'
try {
  $seed = curl.exe -s -X POST -H "Content-Type: application/json" -d '{"clear":true}' http://localhost:4000/api/e2e/seed
  Write-Output "Seed response: $seed"
} catch {
  Write-Output 'Seed request failed (continuing)'
}

# Run Playwright tests against the running dev server
Write-Output 'Running Playwright tests against http://localhost:4000'
$cmd = 'cmd /c "cd apps\\web && set PLAYWRIGHT_START_SERVER=0&& set PLAYWRIGHT_BASE_URL=http://localhost:4000&& npx playwright test --config=playwright.config.ts --reporter=list"'
Invoke-Expression $cmd
