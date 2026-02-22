// This script demonstrates how to create Sentry alert rules via the API.
// Requires SENTRY_AUTH_TOKEN and SENTRY_ORG/SENTRY_PROJECT env vars.
// Run with: node scripts/create-sentry-alerts.js

const fetch = require('node-fetch');

async function createRule(body) {
  const org = process.env.SENTRY_ORG;
  const project = process.env.SENTRY_PROJECT;
  const token = process.env.SENTRY_AUTH_TOKEN;
  if (!org || !project || !token) {
    console.error('set SENTRY_ORG, SENTRY_PROJECT, and SENTRY_AUTH_TOKEN');
    process.exit(1);
  }
  const url = `https://sentry.io/api/0/projects/${org}/${project}/rules/`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  console.log('created rule', data);
}

async function main() {
  // example rule from documentation
  const rule = {
    name: 'Trust snapshot failures',
    actionMatch: 'any',
    conditions: [
      {
        id: 'sentry.rules.conditions.EventFrequencyCondition',
        name: 'Event frequency',
        settings: {
          comparison: '>',
          value: 5,
          interval: '5m',
          event: 'trust.snapshot.fetch_failed_attempt',
        },
      },
    ],
    actions: [
      {
        id: 'sentry.rules.actions.NotifyEmailAction',
        settings: {
          email: 'oncall@yourcompany.com',
        },
      },
    ],
  };
  await createRule(rule);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});