const fs = require('fs');
const pkg = {
  name: 'amoravibe-monorepo',
  version: '1.0.0',
  private: true,
  workspaces: ['apps/*','packages/*','services/*'],
  engines: { node: '>=20.10.0' },
  packageManager: 'pnpm@10.29.2',
  scripts: {
    dev: 'turbo run dev',
    build: 'turbo run build --filter=apps/* --filter=packages/* --filter=services/*',
    lint: 'turbo run lint',
    test: 'turbo run test'
  },
  devDependencies: {
    '@playwright/test': '^1.58.1',
    '@typescript-eslint/eslint-plugin': '^6.21.0',
    '@typescript-eslint/parser': '^6.21.0',
    eslint: '^8.56.0',
    husky: '^9.1.7',
    'lint-staged': '^15.2.0',
    prettier: '^3.2.4',
    turbo: '^2.8.1',
    typescript: '^5.3.3',
    vitest: '^1.2.0',
    '@storybook/react': '^7.0.0'
  },
  dependencies: { encoding: '^0.1.13' },
  'lint-staged': {
    '*.{ts,tsx,js,jsx}': ['npx eslint --max-warnings=0 --no-error-on-unmatched-pattern'],
    '*.{ts,tsx,js,jsx,json,md,yml,yaml}': ['npx prettier --check']
  }
};
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('Wrote package.json');
