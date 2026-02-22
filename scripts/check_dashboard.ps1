Set-Location "$PSScriptRoot\..\apps\web"

$p = 4000
$up = 0
for ($i=0; $i -lt 60; $i++) {
  try {
    $c = curl.exe -s -o $null -w "%{http_code}" "http://localhost:$p/dashboard"
    if ($c -match '^\d+$') { $up = $p; break }
  } catch {
  }
  Start-Sleep -s 1
}
if ($up -eq 0) {
  Write-Output "NOT_UP"
  exit 1
}
Write-Output "OK:$up"

# login (save cookies)
$body = '{"email":"admin@amoravibe.com","password":"admin123"}'
& curl.exe -s -S -X POST -H 'Content-Type: application/json' -d $body "http://localhost:$up/api/login" -c cookies_$up.txt | Write-Output

# fetch messages
$msgs = & curl.exe -s -S -b cookies_$up.txt "http://localhost:$up/api/messages"
Write-Output "MESSAGES:$msgs"

# post a test message
$post = '{"text":"Automated test message from bot"}'
$postRes = & curl.exe -s -S -X POST -H 'Content-Type: application/json' -d $post -b cookies_$up.txt "http://localhost:$up/api/messages"
Write-Output "POST_RESULT:$postRes"
