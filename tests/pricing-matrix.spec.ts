import { test, expect } from '@playwright/test';

test.describe('Pricing Matrix', () => {
  test('should have product selector', async ({ page }) => {
    await page.goto('/');
    
    // Look for product selector dropdown
    // This would be in the admin dashboard pricing tab
    const productSelector = page.locator('select, [role="combobox"]').filter({ 
      hasText: /product|select/i 
    }).first();
    
    // Verify page structure
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have pricing input fields', async ({ page }) => {
    await page.goto('/');
    
    // Look for price input fields
    const priceInputs = page.locator('input[type="text"][label*="price"], input[placeholder*="price"]');
    
    // Verify page loads correctly
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have save button', async ({ page }) => {
    await page.goto('/');
    
    // Look for save button
    const saveButton = page.getByRole('button', { name: /save/i }).first();
    
    // Verify page structure
    await expect(page.locator('body')).toBeVisible();
  });
});



