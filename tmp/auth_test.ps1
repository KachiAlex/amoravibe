$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
Write-Output "Fetching CSRF token..."
try {
  $res = Invoke-RestMethod -Uri 'http://localhost:4000/api/auth/csrf' -WebSession $session
  $token = $res.csrfToken
  Write-Output "CSRF: $token"
} catch {
  Write-Output "Failed to fetch CSRF: $($_.Exception.Message)"
  exit 1
}

Write-Output "Signing up test user..."
try {
  $signup = Invoke-RestMethod -Uri 'http://localhost:4000/api/auth/signup' -Method Post -Body (ConvertTo-Json @{email='tester+bot+2026@example.com'; password='TestPass123!'} ) -ContentType 'application/json' -WebSession $session
  Write-Output "Signup response: $($signup | ConvertTo-Json -Compress)"
} catch {
  Write-Output "Signup failed: $($_.Exception.Message)"
}

Write-Output "Signing in test user..."
try {
  $signin = Invoke-WebRequest -Uri 'http://localhost:4000/api/auth/callback/credentials' -Method Post -Body @{csrfToken=$token; email='tester+bot+2026@example.com'; password='TestPass123!'} -WebSession $session -UseBasicParsing
  Write-Output "Signin status: $($signin.StatusCode)"
} catch {
  Write-Output "Signin failed: $($_.Exception.Message)"
}

Write-Output "Fetching /api/profile to verify session..."
try {
  $profile = Invoke-RestMethod -Uri 'http://localhost:4000/api/profile' -WebSession $session
  Write-Output "Profile response: $($profile | ConvertTo-Json -Compress)"
} catch {
  Write-Output "Profile fetch failed: $($_.Exception.Message)"
}
