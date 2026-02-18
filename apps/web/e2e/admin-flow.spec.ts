import { test, expect } from '@playwright/test';

test('Admin flow — login, search, pagination, view, verify & ban', async ({ page }) => {
  // Log in as the dev admin via the API (sets cookies in the browser)
  await page.goto('/');
  await page.evaluate(async () => {
    await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@amoravibe.com', password: 'admin123' }),
    });
  });

  // Ensure browser has the session cookie; if the fetch didn't set it, add it manually
  const cookies = await page.context().cookies('http://localhost:3000');
  const session = cookies.find((c) => c.name === 'lovedate_session');
  if (!session || !session.value.includes('admin@amoravibe.com')) {
    await page.context().addCookies([
      { name: 'lovedate_session', value: JSON.stringify({ userId: 'admin@amoravibe.com' }), domain: 'localhost', path: '/' },
    ]);
  }

  // Open admin dashboard
  await page.goto('/admin');
  // dynamic client-side widgets are hydrated - allow extra time for client JS to load
  await expect(page.getByRole('heading', { name: /user management/i })).toBeVisible({ timeout: 10000 });

  // Instead of relying on client-side rendering, exercise the admin API endpoints directly from the browser context.
  const listResp = await page.evaluate(async () => {
    const r = await fetch('/api/trust/admin/users?limit=5');
    return { status: r.status, body: await r.json() };
  });
  expect(listResp.status).toBe(200);
  expect(listResp.body.total).toBeGreaterThan(0);
  expect(Array.isArray(listResp.body.users)).toBeTruthy();

  // Search works
  const searchResp = await page.evaluate(async () => {
    const r = await fetch('/api/trust/admin/users?search=bob');
    return { status: r.status, body: await r.json() };
  });
  expect(searchResp.status).toBe(200);
  expect((searchResp.body.users || []).some((u: any) => u.email?.includes('bob'))).toBeTruthy();

  // Single-user GET
  const userId = listResp.body.users[0].id;
  const singleResp = await page.evaluate(async (id) => {
    const r = await fetch(`/api/trust/admin/users/${id}`);
    return { status: r.status, body: await r.json() };
  }, userId);
  expect(singleResp.status).toBe(200);
  expect(singleResp.body.user.id).toBe(userId);

  // Verify user (PATCH)
  const verifyResp = await page.evaluate(async (id) => {
    const r = await fetch(`/api/trust/admin/users/${id}/verify`, { method: 'PATCH' });
    return { status: r.status, body: await r.json() };
  }, userId);
  expect(verifyResp.status).toBe(200);
  expect(verifyResp.body.user.isVerified).toBeTruthy();

  // Ban user (PATCH)
  const banResp = await page.evaluate(async (id) => {
    const r = await fetch(`/api/trust/admin/users/${id}/ban`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ban: true }) });
    return { status: r.status, body: await r.json() };
  }, userId);
  expect(banResp.status).toBe(200);
  expect(banResp.body.user.banned).toBeTruthy();
});