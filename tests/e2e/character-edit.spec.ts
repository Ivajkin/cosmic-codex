import { test, expect } from '@playwright/test';

test.describe('Character Editing', () => {
  test.beforeEach(async ({ page }) => {
    // Mock initial character data
    await page.route('**/api/people/1', async (route) => {
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
    });
  });

  const waitForCharacterDetails = async (page) => {
    // First check if character details are visible
    const details = await page.locator('[data-testid="character-details"]').count();
    if (details === 0) {
      throw new Error('Character details not found. Current page HTML:\n' + await page.content());
    }

    // Then check if edit button exists
    const editButton = await page.locator('button[aria-label="Edit"]').count();
    if (editButton === 0) {
      throw new Error('Edit button not found. Current page HTML:\n' + await page.content());
    }
  };

  test('should edit and save character details', async ({ page }) => {
    await page.goto('/character/1');
    
    // Log the current URL to verify navigation
    console.log('Current URL:', page.url());
    
    await waitForCharacterDetails(page);

    // Log the page content if we get this far
    console.log('Found character details, page content:', await page.content());

    // Verify initial data
    await expect(page.getByText('Luke Skywalker')).toBeVisible();
    await expect(page.getByText('172')).toBeVisible();

    // Click edit button using aria-label
    const editButton = page.locator('button[aria-label="Edit"]');
    await editButton.click();

    // Edit character details using aria-label
    await page.locator('input[aria-label="Height"]').fill('175');
    await page.locator('input[aria-label="Mass"]').fill('80');
    await page.locator('input[aria-label="Hair Color"]').fill('dark blond');

    // Save changes
    await page.locator('button[aria-label="Save"]').click();

    // Verify changes are displayed
    await expect(page.getByText('175')).toBeVisible();
    await expect(page.getByText('80')).toBeVisible();
    await expect(page.getByText('dark blond')).toBeVisible();
  });

  test('should cancel editing without saving changes', async ({ page }) => {
    await page.goto('/character/1');
    await waitForCharacterDetails(page);

    await page.locator('button[aria-label="Edit"]').click();

    // Make changes
    await page.locator('input[aria-label="Height"]').fill('180');
    await page.locator('input[aria-label="Mass"]').fill('85');

    // Cancel changes
    await page.locator('button[aria-label="Cancel"]').click();

    // Verify original values are restored
    await expect(page.getByText('172')).toBeVisible();
    await expect(page.getByText('77')).toBeVisible();
  });

  test('should handle validation errors', async ({ page }) => {
    await page.goto('/character/1');
    await waitForCharacterDetails(page);

    await page.locator('button[aria-label="Edit"]').click();

    // Enter invalid data
    await page.locator('input[aria-label="Height"]').fill('-5');
    await page.locator('input[aria-label="Mass"]').fill('abc');

    // Try to save
    await page.locator('button[aria-label="Save"]').click();

    // Verify error messages
    await expect(page.getByText(/invalid height/i)).toBeVisible();
    await expect(page.getByText(/invalid mass/i)).toBeVisible();
  });

  test('should handle network errors during save', async ({ page }) => {
    // First, navigate and wait for initial data
    await page.goto('/character/1');
    await waitForCharacterDetails(page);

    // Click edit button
    await page.locator('button[aria-label="Edit"]').click();

    // Make changes
    await page.locator('input[aria-label="Height"]').fill('175');

    // Mock API error for the save request
    await page.route('**/api/people/1', async (route) => {
      const method = route.request().method();
      if (method === 'PUT') {
        await route.fulfill({ status: 500 });
      } else {
        // Let other requests (like GET) pass through
        await route.continue();
      }
    });

    // Try to save
    await page.locator('button[aria-label="Save"]').click();

    // Verify error message
    await expect(page.getByText(/failed to save changes/i)).toBeVisible();
  });
}); 