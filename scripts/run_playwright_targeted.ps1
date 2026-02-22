Set-Location 'd:\amoravibe\apps\web'
$env:PLAYWRIGHT_BASE_URL = 'http://localhost:4000'
$env:PLAYWRIGHT_START_SERVER = '0'
npx playwright test 'e2e\admin-dashboard.spec.ts' 'e2e\admin-flow.spec.ts' 'e2e\trust-snapshot-fallback.spec.ts' --workers=1 --reporter=list
