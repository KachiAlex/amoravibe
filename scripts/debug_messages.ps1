$cookie = 'lovedate_session=%7B%22userId%22%3A%22local-guest%22%7D'
$headers = @{ Cookie = $cookie; 'Content-Type' = 'application/json' }
Write-Output "Using cookie: $cookie"

Write-Output '--- GET /api/messages ---'
try {
  $get = Invoke-RestMethod -Uri 'http://localhost:4000/api/messages' -Method Get -Headers $headers -ErrorAction Stop
  $get | ConvertTo-Json -Depth 5 | Write-Output
} catch {
  Write-Output 'GET failed:'
  if ($_.Exception.Response) {
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $text = $reader.ReadToEnd()
    Write-Output $text
  } else {
    Write-Output $_.Exception.Message
  }
}

Write-Output '--- POST /api/messages ---'
$body = '{"text":"debug message from script"}'
try {
  $post = Invoke-RestMethod -Uri 'http://localhost:4000/api/messages' -Method Post -Headers $headers -Body $body -ErrorAction Stop
  $post | ConvertTo-Json -Depth 5 | Write-Output
} catch {
  Write-Output 'POST failed:'
  if ($_.Exception.Response) {
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $text = $reader.ReadToEnd()
    Write-Output $text
  } else {
    Write-Output $_.Exception.Message
  }
}
