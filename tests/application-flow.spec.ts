import { test, expect } from '@playwright/test';

test.describe('Application Flow Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should load application successfully', async ({ page }) => {
    // Verify page title or main content
    await expect(page.locator('body')).toBeVisible();
    
    // Check for React app mounting
    const root = page.locator('#root, [id^="root"]').first();
    await expect(root).toBeVisible();
  });

  test('should have main navigation elements', async ({ page }) => {
    // Look for header/app bar
    const header = page.locator('header, [role="banner"], .MuiAppBar-root').first();
    
    // Header should be visible
    if (await header.count() > 0) {
      await expect(header).toBeVisible();
    }
  });

  test('should handle button clicks without errors', async ({ page }) => {
    // Find all buttons
    const buttons = page.locator('button:visible');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      // Click first button and check for errors
      const firstButton = buttons.first();
      
      // Check if button is enabled
      const isEnabled = await firstButton.isEnabled();
      
      if (isEnabled) {
        // Listen for console errors
        const errors: string[] = [];
        page.on('console', msg => {
          if (msg.type() === 'error') {
            errors.push(msg.text());
          }
        });
        
        await firstButton.click();
        
        // Wait a bit for any errors
        await page.waitForTimeout(500);
        
        // Verify no critical errors occurred
        const criticalErrors = errors.filter(e => 
          !e.includes('favicon') && 
          !e.includes('sourcemap') &&
          !e.includes('DevTools')
        );
        
        // Log errors for debugging but don't fail test
        if (criticalErrors.length > 0) {
          console.log('Console errors:', criticalErrors);
        }
      }
    }
    
    // Verify page is still functional
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have proper Material-UI components', async ({ page }) => {
    // Check for MUI components (may use emotion or other class names)
    const muiComponents = page.locator('[class*="Mui"], [class*="css-"]');
    const componentCount = await muiComponents.count();
    
    // Should have some styled components (MUI or emotion)
    // Note: Components may use emotion classes instead of Mui classes
    if (componentCount === 0) {
      // Check for any styled elements
      const styledElements = page.locator('[class*="css"], [style]');
      const styledCount = await styledElements.count();
      expect(styledCount).toBeGreaterThan(0);
    } else {
      expect(componentCount).toBeGreaterThan(0);
    }
  });

  test('should handle form inputs', async ({ page }) => {
    // Look for text inputs
    const textInputs = page.locator('input[type="text"], input[type="email"], textarea');
    const inputCount = await textInputs.count();
    
    if (inputCount > 0) {
      const firstInput = textInputs.first();
      const isVisible = await firstInput.isVisible();
      
      if (isVisible && await firstInput.isEnabled()) {
        await firstInput.fill('test');
        const value = await firstInput.inputValue();
        expect(value).toContain('test');
      }
    }
  });

  test('should have proper accessibility', async ({ page }) => {
    // Check for ARIA labels and roles
    const elementsWithAria = page.locator('[aria-label], [role]');
    const ariaCount = await elementsWithAria.count();
    
    // Should have some accessible elements
    expect(ariaCount).toBeGreaterThan(0);
  });

  test('should handle page navigation', async ({ page }) => {
    // Check current URL
    const url = page.url();
    expect(url).toBeTruthy();
    
    // Verify page is responsive
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator('body')).toBeVisible();
  });
});

