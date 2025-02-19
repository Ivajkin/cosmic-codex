import { test, expect } from '@playwright/test';

test.describe('Character Editing', () => {
  test.beforeEach(async ({ page }) => {
    // Mock initial character data
    await page.route('**/api/people/1', async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            name: 'Luke Skywalker',
            height: '172',
            mass: '77',
            hair_color: 'blond',
            skin_color: 'fair',
            eye_color: 'blue',
            birth_year: '19BBY',
            gender: 'male',
            url: 'https://swapi.dev/api/people/1/'
          })
        });
      } else if (method === 'PUT') {
        // Mock successful PUT response
        const requestBody = JSON.parse(route.request().postData() || '{}');
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(requestBody)
        });
      } else {
        await route.continue();
      }
    });
  });

  test('should edit and save character details', async ({ page }) => {
    await page.goto('/character/1');
    
    // Wait for the character details to be visible
    await expect(page.locator('[data-testid="character-details"]')).toBeVisible();
    await expect(page.getByText('Luke Skywalker')).toBeVisible();
    await expect(page.getByText('172')).toBeVisible();

    // Click edit button
    await page.getByRole('button', { name: 'Edit' }).click();

    // Edit character details
    await page.getByLabel('Height').fill('175');
    await page.getByLabel('Mass').fill('80');
    await page.getByLabel('Hair Color').fill('dark blond');

    // Save changes
    await page.getByRole('button', { name: 'Save' }).click();

    // Wait for save to complete and verify changes are displayed
    await expect(page.getByText('175')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('80')).toBeVisible();
    await expect(page.getByText('dark blond')).toBeVisible();
  });

  test('should cancel editing without saving changes', async ({ page }) => {
    await page.goto('/character/1');
    
    // Wait for the character details to be visible
    await expect(page.locator('[data-testid="character-details"]')).toBeVisible();

    // Click edit button
    await page.getByRole('button', { name: 'Edit' }).click();

    // Make changes
    await page.getByLabel('Height').fill('180');
    await page.getByLabel('Mass').fill('85');

    // Cancel changes
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Verify original values are restored
    await expect(page.getByText('172')).toBeVisible();
    await expect(page.getByText('77')).toBeVisible();
  });

  test('should handle validation errors', async ({ page }) => {
    await page.goto('/character/1');
    
    // Wait for the character details to be visible
    await expect(page.locator('[data-testid="character-details"]')).toBeVisible();

    // Click edit button
    await page.getByRole('button', { name: 'Edit' }).click();

    // Enter invalid data
    await page.getByLabel('Height').fill('-5');
    await page.getByLabel('Mass').fill('abc');

    // Try to save
    await page.getByRole('button', { name: 'Save' }).click();

    // Verify error messages
    await expect(page.getByText('Invalid height')).toBeVisible();
    await expect(page.getByText('Invalid mass')).toBeVisible();
  });

  test('should handle network errors during save', async ({ page }) => {
    await page.goto('/character/1');
    
    // Wait for the character details to be visible
    await expect(page.locator('[data-testid="character-details"]')).toBeVisible();

    // Click edit button
    await page.getByRole('button', { name: 'Edit' }).click();

    // Make changes
    await page.getByLabel('Height').fill('175');

    // Mock API error for the save request
    await page.route('**/api/people/1', async (route) => {
      const method = route.request().method();
      if (method === 'PUT') {
        await route.fulfill({ 
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' })
        });
      } else {
        await route.continue();
      }
    });

    // Try to save
    await page.getByRole('button', { name: 'Save' }).click();

    // Wait for and verify error message in Alert component
    await expect(page.locator('.MuiAlert-root')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.MuiAlert-root')).toContainText('Failed to save changes');
  });
}); 