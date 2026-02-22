$port=4000
$log='D:\amoravibe\dev_log.txt'
$err='D:\amoravibe\dev_log_err.txt'
$owner=(Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue).OwningProcess
if ($owner) {
  Write-Output "Killing PID $owner"
  Stop-Process -Id $owner -Force -ErrorAction SilentlyContinue
} else {
  Write-Output "No process on port $port"
}
Start-Process -FilePath npm -ArgumentList 'run','dev' -WorkingDirectory 'D:\amoravibe\apps\web' -RedirectStandardOutput $log -RedirectStandardError $err -WindowStyle Minimized
Write-Output 'Started dev in background, waiting for readiness...'
for ($i=0; $i -lt 60; $i++) {
  $code = & curl.exe -s -o NUL -w '%{http_code}' http://localhost:4000/dashboard
  Write-Output "attempt $i -> $code"
  if ($code -eq '200') { Write-Output 'Server ready'; break }
  Start-Sleep -Seconds 1
}
Write-Output '--- dev_log tail ---'
if (Test-Path $log) { Get-Content $log -Tail 80 } else { Write-Output 'dev_log.txt missing' }
Write-Output 'Running node test...'
node scripts/test_messages.js
