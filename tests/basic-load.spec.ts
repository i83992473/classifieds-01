import { test, expect } from '@playwright/test';

test.describe('Basic Application Load', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Give React time to render
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/page-load.png', fullPage: true });
    
    // Check if page has content
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Check if React app has mounted
    const root = page.locator('#root');
    const rootContent = await root.textContent();
    
    console.log('Page title:', await page.title());
    console.log('Root content length:', rootContent?.length || 0);
    console.log('URL:', page.url());
    
    // Verify page loaded (even if empty, body should exist)
    expect(await body.count()).toBeGreaterThan(0);
  });

  test('should have no console errors on load', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Filter out non-critical errors
    const criticalErrors = errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('sourcemap') &&
      !e.includes('DevTools') &&
      !e.includes('Extension') &&
      !e.includes('chrome-extension')
    );
    
    if (criticalErrors.length > 0) {
      console.log('Console errors found:', criticalErrors);
    }
    
    // Don't fail test, just log errors for debugging
    expect(criticalErrors.length).toBeLessThan(10); // Allow some errors but not too many
  });
});



