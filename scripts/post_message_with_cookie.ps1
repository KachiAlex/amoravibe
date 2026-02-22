$cookieLine = Get-Content cookies.txt | Where-Object {$_ -and $_ -notmatch '^#' -and $_ -match 'lovedate_session'} | Select-Object -Last 1
if (-not $cookieLine) { Write-Output 'lovedate_session not found in cookies.txt'; exit 1 }
$val = ($cookieLine -split '\s+')[-1]
$cookie = "lovedate_session=$val"
Write-Output "Using Cookie: $cookie"
$headers = @{ Cookie = $cookie; 'Content-Type' = 'application/json' }
$body = '{"text":"hello from agent (ps)"}'
try {
  $resp = Invoke-RestMethod -Uri 'http://localhost:4000/api/messages' -Method Post -Headers $headers -Body $body -ErrorAction Stop
  Write-Output 'Response body:'
  $resp | ConvertTo-Json -Depth 5
} catch {
  Write-Output 'Request failed:'
  if ($_.Exception.Response -ne $null) {
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $text = $reader.ReadToEnd()
    Write-Output $text
  } else {
    Write-Output $_.Exception.Message
  }
  exit 1
}
