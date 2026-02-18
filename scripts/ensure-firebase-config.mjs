import fs from 'node:fs'
import path from 'node:path'

const CONFIG_PATH = path.resolve('firebase.json')
const EXPECTED_SOURCE = 'apps/web'
const EXPECTED_REGION = 'us-central1'

function fail(message) {
  console.error(`Firebase config guard failed: ${message}`)
  process.exit(1)
}

try {
  const raw = fs.readFileSync(CONFIG_PATH, 'utf8')
  const config = JSON.parse(raw)
  const source = config?.hosting?.source
  const region = config?.hosting?.frameworksBackend?.region

  if (source !== EXPECTED_SOURCE) {
    fail(`hosting.source must remain "${EXPECTED_SOURCE}" (found ${JSON.stringify(source)})`)
  }

  if (region !== EXPECTED_REGION) {
    fail(`hosting.frameworksBackend.region must remain "${EXPECTED_REGION}" (found ${JSON.stringify(region)})`)
  }

  console.log('Firebase config guard passed.')
} catch (error) {
  fail(error instanceof Error ? error.message : String(error))
}
