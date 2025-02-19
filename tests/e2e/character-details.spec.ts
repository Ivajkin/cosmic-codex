import { test, expect } from '@playwright/test';

test.describe('Character Details Page', () => {
  test('should display character details', async ({ page }) => {
    await page.goto('/character/1'); // Luke Skywalker
    
    await page.waitForSelector('[data-testid="character-details"]');
    
    // Verify character information is displayed
    await expect(page.getByTestId('character-name')).toContainText('Luke Skywalker');
    await expect(page.getByTestId('character-details')).toContainText('Height: 172');
  });

  test('should edit and persist character details locally', async ({ page }) => {
    await page.goto('/character/1');
    
    // Click edit button
    await page.getByRole('button', { name: 'Edit' }).click();
    
    // Edit height
    const heightInput = page.getByLabel('Height');
    await heightInput.clear();
    await heightInput.fill('180');
    
    // Save changes
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Verify changes are saved
    await expect(page.getByTestId('character-details')).toContainText('Height: 180');
    
    // Reload page and verify persistence
    await page.reload();
    await expect(page.getByTestId('character-details')).toContainText('Height: 180');
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock failed API response
    await page.route('**/api/people/1', (route) => 
      route.fulfill({ status: 500 })
    );
    
    await page.goto('/character/1');
    
    // Verify error message is displayed
    await expect(page.getByTestId('error-message')).toBeVisible();
  });
}); 