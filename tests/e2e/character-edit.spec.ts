import { test, expect } from '@playwright/test';

test('should edit and save character details locally', async ({ page }) => {
  // Mock initial character data
  await page.route('**/api/people/1/', async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({
        name: 'Luke Skywalker',
        height: '172',
        mass: '77',
        birth_year: '19BBY',
        url: 'https://swapi.dev/api/people/1/',
      }),
    });
  });

  await page.goto('/character/1');
  await expect(page.getByText('Luke Skywalker')).toBeVisible();

  // Click edit button
  await page.getByRole('button', { name: 'Edit' }).click();

  // Edit height
  const heightInput = page.getByLabel('Height');
  await heightInput.clear();
  await heightInput.fill('180');

  // Save changes
  await page.getByRole('button', { name: 'Save' }).click();

  // Verify changes are saved
  await expect(page.getByText('Height: 180')).toBeVisible();

  // Reload page and verify persistence
  await page.reload();
  await expect(page.getByText('Height: 180')).toBeVisible();
});

test('should cancel editing without saving changes', async ({ page }) => {
  await page.route('**/api/people/1/', async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({
        name: 'Luke Skywalker',
        height: '172',
        mass: '77',
        birth_year: '19BBY',
        url: 'https://swapi.dev/api/people/1/',
      }),
    });
  });

  await page.goto('/character/1');
  await expect(page.getByText('Height: 172')).toBeVisible();

  // Click edit button
  await page.getByRole('button', { name: 'Edit' }).click();

  // Edit height
  const heightInput = page.getByLabel('Height');
  await heightInput.clear();
  await heightInput.fill('180');

  // Cancel editing
  await page.getByRole('button', { name: 'Cancel' }).click();

  // Verify original value is retained
  await expect(page.getByText('Height: 172')).toBeVisible();
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