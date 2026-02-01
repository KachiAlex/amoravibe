param(
  [string]$repo = 'KachiAlex/lovedate',
  [string]$workflow = 'deploy-web.yml',
  [int]$limit = 10
)

# locate gh executable (respect PATH first, then common install locations)
$ghCmd = Get-Command gh -ErrorAction SilentlyContinue
if ($ghCmd) {
  $ghExe = $ghCmd.Path
} else {
  $candidates = @(
    "$env:ProgramFiles\GitHub CLI\gh.exe",
    "$env:LOCALAPPDATA\Programs\GitHub CLI\gh.exe",
    'C:\Program Files\GitHub CLI\gh.exe'
  )
  $ghExe = $null
  foreach ($p in $candidates) { if (Test-Path $p) { $ghExe = $p; break } }
  if (-not $ghExe) {
    Write-Error "GitHub CLI ('gh') not found. Install it or add it to PATH. Checked: $($candidates -join ', ')"
    exit 1
  }
}

$runsJson = & $ghExe run list --repo $repo --workflow $workflow --limit $limit --json databaseId,conclusion,status,headBranch,headSha,url
$runs = $runsJson | ConvertFrom-Json
if (-not $runs) {
  Write-Output 'No runs found' | Out-File runs-summary.txt -Encoding utf8
  exit 0
}

# summary
$runs | ForEach-Object {
  "$($_.databaseId) | status=$($_.status) | conclusion=$($_.conclusion) | branch=$($_.headBranch) | sha=$($_.headSha) | url=$($_.url)"
} | Out-File runs-summary.txt -Encoding utf8

# latest
 $latest = $runs[0].databaseId
 $latestUrl = $runs[0].url
"Latest run id: $latest" | Out-File latest-id.txt -Encoding utf8

# try to save logs to file
try {
  & $ghExe run view $latest --repo $repo --log > "run-$latest.log" 2>&1
  if ((Get-Item "run-$latest.log").Length -gt 0) {
    Write-Output "Saved logs to run-$latest.log and summary to runs-summary.txt"
    exit 0
  } else {
    Write-Output "Log file empty; attempting download of artifacts."
  }
} catch {
  Write-Output "gh run view failed: $_"
}

# try download artifacts / logs folder
try {
  & $ghExe run download $latest --repo $repo --dir "gh-run-$latest"
  if (Test-Path "gh-run-$latest") {
    Write-Output "Downloaded run files to .\\gh-run-$latest"
    exit 0
  }
} catch {
  Write-Output "gh run download failed: $_"
}

# fallback: open in browser
Write-Output "Opening run in web browser: $latestUrl"
Start-Process $latestUrl
