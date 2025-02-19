import { test, expect } from '@playwright/test';

test('should display character details', async ({ page }) => {
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
  await expect(page.getByText('Height: 172')).toBeVisible();
  await expect(page.getByText('Mass: 77')).toBeVisible();
  await expect(page.getByText('Birth Year: 19BBY')).toBeVisible();
});

test('should handle error state', async ({ page }) => {
  await page.route('**/api/people/1/', async (route) => {
    await route.fulfill({ status: 500 });
  });

  await page.goto('/character/1');
  await expect(page.getByText('Failed to load character details')).toBeVisible();
}); 