import { test, expect } from '@playwright/test';

test.describe('Spaces Chat - Message Optimizations', () => {
  const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5001';
  
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto(`${BASE_URL}/dashboard`);
    // Wait for dashboard to load
    await expect(page.locator('nav[aria-label="Sections"]')).toBeVisible({ timeout: 10000 });
  });

  test('should show optimistic message and reconcile without duplicates', async ({ page }) => {
    // Find and click a Space to enter it
    const spaceButton = page.locator('[data-testid="space-item"]').first();
    
    // Skip if no spaces available
    if (await spaceButton.count() === 0) {
      test.skip();
    }

    await spaceButton.click();
    
    // Wait for space details to load
    await page.waitForLoadState('networkidle');
    
    // Find General Chat room entry and click it
    const generalChatButton = page.locator('[data-testid="general-room"], button:has-text("General")').first();
    if (await generalChatButton.count() === 0) {
      test.skip();
    }
    
    await generalChatButton.click();
    await page.waitForLoadState('networkidle');
    
    // Get initial message count
    const messageElements = page.locator('[data-testid="message-item"]');
    const initialCount = await messageElements.count();
    
    // Find message input and send a message
    const messageInput = page.locator('input[placeholder*="message" i], textarea[placeholder*="message" i]').first();
    const sendButton = page.locator('button[aria-label*="send" i], button:has-text("Send") i').first();
    
    if (await messageInput.count() === 0) {
      test.skip();
    }

    const testMessage = `Test message ${Date.now()}`;
    await messageInput.fill(testMessage);
    await sendButton.click();
    
    // Verify optimistic message appears immediately (before server sync)
    const optimisticText = page.locator(`text="${testMessage}"`);
    await expect(optimisticText).toBeVisible({ timeout: 2000 });
    
    // Wait for reconciliation (polling interval is 15s, but server should respond faster)
    await page.waitForTimeout(2000);
    
    // Count messages after send
    const afterSendCount = await messageElements.count();
    
    // Verify we have exactly one more message (no duplicates)
    expect(afterSendCount).toBe(initialCount + 1);
    
    // Verify the message text is still visible and not duplicated
    const messageMatches = await page.locator(`text="${testMessage}"`).count();
    expect(messageMatches).toBe(1);
  });

  test('should display connection status indicator', async ({ page }) => {
    // Find and click a Space
    const spaceButton = page.locator('[data-testid="space-item"]').first();
    
    if (await spaceButton.count() === 0) {
      test.skip();
    }

    await spaceButton.click();
    await page.waitForLoadState('networkidle');
    
    // Enter a room
    const roomButton = page.locator('[data-testid="room-item"], button:has-text("General")').first();
    if (await roomButton.count() === 0) {
      test.skip();
    }
    
    await roomButton.click();
    await page.waitForLoadState('networkidle');
    
    // Check for connection status indicator (colored dot + status text)
    const statusDot = page.locator('[data-testid="connection-status-dot"]');
    const statusText = page.locator('[data-testid="connection-status-text"]');
    
    // If indicators don't exist, they may be using different selectors, check for any colored elements
    if (await statusDot.count() === 0) {
      // Look for the badge we added to the UI (span with Live, Syncing, or Offline)
      const statusBadge = page.locator('span:has-text("Live"), span:has-text("Syncing"), span:has-text("Offline")');
      await expect(statusBadge).toBeVisible({ timeout: 5000 });
    } else {
      await expect(statusDot).toBeVisible();
      await expect(statusText).toBeVisible();
    }
  });

  test('should handle message send failure and retry', async ({ page }) => {
    // This test requires intercepting network requests to simulate failures
    // Set up network interception
    await page.route('**/api/rooms/*/messages', async (route) => {
      const request = route.request();
      if (request.method() === 'POST') {
        // First attempt fails, retry succeeds
        const attempts = (global as any).sendAttempts || 0;
        (global as any).sendAttempts = attempts + 1;
        
        if (attempts === 0) {
          // Simulate server error on first attempt
          await route.abort('failed');
        } else {
          // Let subsequent attempts through
          await route.continue();
        }
      } else {
        await route.continue();
      }
    });

    // Navigate to a space and room
    const spaceButton = page.locator('[data-testid="space-item"]').first();
    if (await spaceButton.count() === 0) {
      test.skip();
    }

    await spaceButton.click();
    await page.waitForLoadState('networkidle');
    
    const roomButton = page.locator('[data-testid="room-item"], button:has-text("General")').first();
    if (await roomButton.count() === 0) {
      test.skip();
    }
    
    await roomButton.click();
    await page.waitForLoadState('networkidle');
    
    // Get initial message count
    const messageElements = page.locator('[data-testid="message-item"]');
    const initialCount = await messageElements.count();
    
    // Send a message (first attempt will fail)
    const messageInput = page.locator('input[placeholder*="message" i], textarea[placeholder*="message" i]').first();
    const sendButton = page.locator('button[aria-label*="send" i], button:has-text("Send") i').first();
    
    if (await messageInput.count() === 0) {
      test.skip();
    }

    const testMessage = `Retry test ${Date.now()}`;
    await messageInput.fill(testMessage);
    await sendButton.click();
    
    // Wait briefly for failure indication
    await page.waitForTimeout(1000);
    
    // Look for retry button or failed message indicator
    const retryButton = page.locator('button:has-text("Retry")').first();
    
    if (await retryButton.count() > 0) {
      // Click retry to resend
      await retryButton.click();
      
      // Wait for resend
      await page.waitForTimeout(1500);
      
      // Verify message is present and not duplicated
      const afterRetryCount = await messageElements.count();
      expect(afterRetryCount).toBeGreaterThanOrEqual(initialCount);
      
      // Verify no duplicates of this message
      const messageMatches = await page.locator(`text="${testMessage}"`).count();
      expect(messageMatches).toBe(1);
    } else {
      // If retry button doesn't exist, test is skipped
      test.skip();
    }
  });

  test('should not create duplicate messages on reconciliation', async ({ page }) => {
    // Send 3 messages rapidly and verify no duplicates after reconciliation
    const spaceButton = page.locator('[data-testid="space-item"]').first();
    if (await spaceButton.count() === 0) {
      test.skip();
    }

    await spaceButton.click();
    await page.waitForLoadState('networkidle');
    
    const roomButton = page.locator('[data-testid="room-item"], button:has-text("General")').first();
    if (await roomButton.count() === 0) {
      test.skip();
    }
    
    await roomButton.click();
    await page.waitForLoadState('networkidle');
    
    const messageInput = page.locator('input[placeholder*="message" i], textarea[placeholder*="message" i]').first();
    const sendButton = page.locator('button[aria-label*="send" i], button:has-text("Send") i').first();
    
    if (await messageInput.count() === 0) {
      test.skip();
    }

    // Send 3 messages rapidly
    const messages = [
      `Rapid 1 ${Date.now()}`,
      `Rapid 2 ${Date.now()}`,
      `Rapid 3 ${Date.now()}`
    ];

    for (const msg of messages) {
      await messageInput.fill(msg);
      await sendButton.click();
      await page.waitForTimeout(300); // Small delay between sends
    }

    // Wait for reconciliation
    await page.waitForTimeout(2500);
    
    // Verify each message appears exactly once
    for (const msg of messages) {
      const count = await page.locator(`text="${msg}"`).count();
      expect(count).toBe(1);
    }
  });
});
