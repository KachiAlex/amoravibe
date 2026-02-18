# Build the Docker image and run the e2e test
$tag = 'amoravibe-e2e:latest'
$dockerfile = 'docker/playwright.Dockerfile'

Write-Output "Building Docker image $tag..."
docker build -f $dockerfile -t $tag .

Write-Output "Running Playwright e2e test in container..."
docker run --rm --workdir /workspace $tag
