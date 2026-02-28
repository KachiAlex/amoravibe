$base = 'http://localhost:4000'
$now = (Get-Date).ToString('yyyyMMddHHmmss')
$email = "smoke+$now@example.com"
$password = 'Password123!'
Write-Host "Signup: $email"
$signupBody = @{ email = $email; password = $password } | ConvertTo-Json
try {
  $signup = Invoke-RestMethod -Uri "$base/api/auth/signup" -Method Post -ContentType 'application/json' -Body $signupBody -ErrorAction Stop
  Write-Host "Signup response: $($signup | ConvertTo-Json -Compress)"
} catch {
  Write-Host "Signup failed: $($_.Exception.Message)"
  exit 2
}
$userId = $signup.userId
if (-not $userId) { Write-Host 'No userId in signup response'; exit 3 }
$sessionJson = @{ userId = $userId } | ConvertTo-Json -Compress
$cookieVal = [System.Uri]::EscapeDataString($sessionJson)
Write-Host "Using lovedate_session cookie: $cookieVal"
$profileBody = @{ name='Smoke Tester'; age=30 } | ConvertTo-Json
try {
  $profile = Invoke-RestMethod -Uri "$base/api/profile" -Method Patch -ContentType 'application/json' -Headers @{ Cookie = "lovedate_session=$cookieVal" } -Body $profileBody -ErrorAction Stop
  Write-Host "Profile patch response: $($profile | ConvertTo-Json -Compress)"
} catch {
  Write-Host "Profile patch failed: $($_.Exception.Message)"
  exit 4
}
try {
  $dash = Invoke-WebRequest -Uri "$base/dashboard" -Method Get -Headers @{ Cookie = "lovedate_session=$cookieVal" } -UseBasicParsing -ErrorAction Stop
  Write-Host "Dashboard status: $($dash.StatusCode)"
  $content = $dash.Content
  if ($content.Length -gt 200) { $snippet = $content.Substring(0,200) + '...' } else { $snippet = $content }
  Write-Host "Dashboard content snippet: $snippet"
} catch {
  Write-Host "Dashboard fetch failed: $($_.Exception.Message)"
  exit 5
}
Write-Host 'SMOKE TEST COMPLETE'
