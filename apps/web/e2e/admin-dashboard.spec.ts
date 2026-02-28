import { test, expect } from '@playwright/test';

// Basic admin dashboard UI test
// Assumes admin is already authenticated or public for test

test('Admin Dashboard: should render all main widgets', async ({ page }) => {
  // Ensure admin session exists for this test
  await page.context().addCookies([
    { name: 'lovedate_session', value: JSON.stringify({ userId: 'admin@amoravibe.com' }), domain: 'localhost', path: '/' },
  ]);

  await page.goto('/admin', { waitUntil: 'domcontentloaded', timeout: 45_000 });

  // Wait for admin page shell to render, then allow extra time for client widgets to hydrate
  await expect(page.getByRole('heading', { name: /admin dashboard/i })).toBeVisible({ timeout: 30_000 });

  const widgetHeadings = [
    /platform metrics/i,
    /user management/i,
    /activity log/i,
    /trust\/verification override/i,
    /system health/i,
  ];

  for (const heading of widgetHeadings) {
    await expect(page.getByRole('heading', { name: heading })).toBeVisible({ timeout: 30_000 });
  }
});

test('Admin Dashboard: user management actions and trust override', async ({ page }) => {
  await page.request.post('/api/e2e/admin-users/reset', {
    data: {
      'bob@example.com': { isVerified: false, banned: false },
      'local-guest': { isVerified: false, banned: false },
    },
  });

  await page.context().addCookies([
    { name: 'lovedate_session', value: JSON.stringify({ userId: 'admin@amoravibe.com' }), domain: 'localhost', path: '/' },
  ]);

  await page.goto('/admin', { waitUntil: 'domcontentloaded', timeout: 45_000 });
  await expect(page.getByRole('heading', { name: /user management/i })).toBeVisible({ timeout: 30_000 });

  const waitForUsersReload = () =>
    page.waitForResponse(
      (res) => res.url().includes('/api/trust/admin/users') && res.request().method() === 'GET',
      { timeout: 30_000 },
    );

  const searchInput = page.getByPlaceholder('Search by name, email or city');
  const searchReload = waitForUsersReload();
  await searchInput.fill('bob@example.com');
  await searchReload;

  const bobRow = () => page.getByRole('row', { name: /bob@example.com/i }).first();
  await expect(bobRow()).toBeVisible({ timeout: 30_000 });

  const bobUserId = await page.evaluate(async () => {
    const resp = await fetch('/api/trust/admin/users?search=' + encodeURIComponent('bob@example.com'));
    const body = await resp.json();
    return body.users?.[0]?.id;
  });
  expect(bobUserId).toBeTruthy();

  await bobRow().getByRole('button', { name: /view/i }).click();
  await expect(page.getByText(/bob@example.com/i)).toBeVisible();

  const getUserField = (field: 'isVerified' | 'banned') =>
    page.evaluate(async ({ id, key }) => {
      const resp = await fetch('/api/trust/admin/users/' + encodeURIComponent(id));
      const body = await resp.json();
      return body.user?.[key];
    }, { id: bobUserId!, key: field });

  const waitForField = async (field: 'isVerified' | 'banned', expected: boolean) => {
    await expect
      .poll(async () => Boolean(await getUserField(field)), { timeout: 30_000, message: `${field} did not reach ${expected}` })
      .toBe(expected);
  };

  const verifyButton = () => bobRow().getByRole('button', { name: /^Verify$/i });
  if (await verifyButton().count()) {
    const reload = waitForUsersReload();
    await verifyButton().click();
    await reload;
  } else {
    await expect(verifyButton()).toHaveCount(0);
  }
  await waitForField('isVerified', true);

  const banToggle = () => bobRow().getByRole('button', { name: /ban|unban/i }).first();
  const currentLabel = (await banToggle().textContent())?.trim().toLowerCase();
  const toggleBan = async (expected: boolean, actionName: RegExp) => {
    const reload = waitForUsersReload();
    await bobRow().getByRole('button', { name: actionName }).click();
    await reload;
    await waitForField('banned', expected);
  };

  if (currentLabel === 'ban') {
    await toggleBan(true, /^Ban$/i);
    await toggleBan(false, /^Unban$/i);
  } else {
    await toggleBan(false, /^Unban$/i);
  }

  const overrideInput = page.getByPlaceholder('User ID');
  await overrideInput.fill('local-guest');
  await page.getByRole('button', { name: /mark verified/i }).click();
  await expect(page.getByText(/User local-guest marked as verified/i)).toBeVisible({ timeout: 30_000 });
});
