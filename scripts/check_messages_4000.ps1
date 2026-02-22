Set-Location "$PSScriptRoot\..\apps\web"

Write-Output "Checking API on port 4000"

$up = 4000

Write-Output "DASHBOARD: (using curl)"
try {
  $dash = & curl.exe -s -o nul -w "%{http_code}" "http://localhost:$up/dashboard"
  Write-Output "DASHBOARD_HTTP_CODE: $dash"
} catch {
  Write-Output "DASHBOARD_ERROR: $($_.Exception.Message)"
}

# login with curl and save cookies
$loginBody = '{"email":"admin@amoravibe.com","password":"admin123"}'
Write-Output "Logging in..."
try {
  $loginOut = & curl.exe -s -S -X POST -H "Content-Type: application/json" -d $loginBody "http://localhost:$up/api/login" -c cookies_$up.txt
  Write-Output "LOGIN_RESPONSE: $loginOut"
} catch {
  Write-Output "LOGIN_ERROR: $($_.Exception.Message)"
}

try {
  $msgs = & curl.exe -s -S -b cookies_$up.txt "http://localhost:$up/api/messages"
  Write-Output "MESSAGES: $msgs"
} catch {
  Write-Output "MESSAGES_ERROR: $($_.Exception.Message)"
}

try {
  $post = '{"text":"Automated test message from bot"}'
  $postRes = & curl.exe -s -S -X POST -H "Content-Type: application/json" -d $post -b cookies_$up.txt "http://localhost:$up/api/messages"
  Write-Output "POST_RESULT: $postRes"
} catch {
  Write-Output "POST_ERROR: $($_.Exception.Message)"
}

exit 0
