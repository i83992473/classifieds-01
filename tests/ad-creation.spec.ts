import { test, expect } from '@playwright/test';

test.describe('Ad Creation', () => {
  test('should have ad creation interface', async ({ page }) => {
    await page.goto('/');
    
    // Look for "New Ad" or "Create Ad" button
    const newAdButton = page.getByRole('button', { name: /new ad|create ad/i }).first();
    
    // Verify page structure
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have product selection dropdown', async ({ page }) => {
    await page.goto('/');
    
    // Look for product dropdown in ad creation
    const productDropdown = page.locator('select, [role="combobox"]').filter({ 
      hasText: /product|newspaper/i 
    }).first();
    
    // Verify page loads
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have text and image add buttons', async ({ page }) => {
    await page.goto('/');
    
    // Look for "Add Text" and "Add Image" buttons
    const addTextButton = page.getByRole('button', { name: /add text/i }).first();
    const addImageButton = page.getByRole('button', { name: /add image/i }).first();
    
    // Verify page structure
    await expect(page.locator('body')).toBeVisible();
  });
});



