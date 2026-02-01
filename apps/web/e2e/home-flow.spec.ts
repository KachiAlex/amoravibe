import { test, expect } from '@playwright/test';

test.describe('Onboarding → Home feed flow', () => {
  test('completes onboarding, redirects to dashboard, and can like a card', async ({ page }) => {
    // Start on onboarding page
    await page.goto('/onboarding');

    // Fill a minimal onboarding form — adapt selectors to real form
    // If your onboarding is modal-driven, adjust to trigger modal
    const nameInput = page.locator('input[name="displayName"]');
    if (await nameInput.count()) {
      await nameInput.fill('E2E User');
    }

    const submit = page.locator('button[type="submit"]');
    await expect(submit).toBeVisible();
    await Promise.all([page.waitForNavigation({ url: '**/dashboard**' }), submit.click()]);

    // We're on dashboard — assert feed cards exist
    await expect(page).toHaveURL(/dashboard/);

    // Wait for feed to render
    await page.waitForSelector('text=Curated for your orbit');
    await page.waitForSelector('[data-testid="feed-card"]', { timeout: 5000 }).catch(() => {});

    // Intercept the user action network call and assert it's called on Like
    let actionCalled = false;
    await page.route('**/api/user/action', (route) => {
      actionCalled = true;
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    // Click first like button in feed
    const likeButton = page.locator('button', { hasText: 'Like' }).first();
    await expect(likeButton).toBeVisible();
    await likeButton.click();

    // Wait a moment for network to be intercepted
    await page.waitForTimeout(300);
    expect(actionCalled).toBe(true);
  });
});
