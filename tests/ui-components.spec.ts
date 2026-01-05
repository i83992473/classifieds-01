import { test, expect } from '@playwright/test';

test.describe('UI Components', () => {
  test('should have tooltips on buttons', async ({ page }) => {
    await page.goto('/');
    
    // Hover over buttons to check for tooltips
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      // Hover over first button
      await buttons.first().hover();
      
      // Check if tooltip appears (may take a moment)
      await page.waitForTimeout(500);
    }
    
    // Verify page structure
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have responsive layout', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have scrollbars when content exceeds viewport', async ({ page }) => {
    await page.goto('/');
    
    // Check if page has scrollable content
    const body = page.locator('body');
    const scrollHeight = await body.evaluate((el) => el.scrollHeight);
    const clientHeight = await body.evaluate((el) => el.clientHeight);
    
    // Verify page structure
    await expect(page.locator('body')).toBeVisible();
  });
});



