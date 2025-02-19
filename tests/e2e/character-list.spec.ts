import { test, expect } from '@playwright/test';

test.describe('Character List Page', () => {
  test('should display character list with pagination', async ({ page }) => {
    // Mock the API response
    await page.route('**/api/people/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          count: 82,
          next: 'https://swapi.dev/api/people/?page=2',
          previous: null,
          results: [
            {
              name: 'Luke Skywalker',
              height: '172',
              mass: '77',
              birth_year: '19BBY',
              gender: 'male',
              url: 'https://swapi.dev/api/people/1/'
            }
          ]
        })
      });
    });

    console.log('Test: Navigating to home page');
    await page.goto('/');
    
    console.log('Test: Waiting for character list');
    await page.waitForSelector('[data-testid="character-list"]', { timeout: 15000 });
    
    console.log('Test: Checking for character cards');
    const characters = await page.getByTestId('character-card').all();
    console.log('Test: Found character cards:', characters.length);
    expect(characters.length).toBeGreaterThan(0);
    
    console.log('Test: Checking pagination');
    const nextButton = page.getByRole('button', { name: 'Next page' });
    expect(await nextButton.isVisible()).toBeTruthy();
  });

  test('should search for characters', async ({ page }) => {
    // Mock the search API response
    await page.route('**/api/people/**', async (route) => {
      const url = route.request().url();
      if (url.includes('search=Luke')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            count: 1,
            results: [{
              name: 'Luke Skywalker',
              height: '172',
              mass: '77',
              birth_year: '19BBY',
              gender: 'male',
              url: 'https://swapi.dev/api/people/1/'
            }]
          })
        });
      } else {
        // Default response for initial load
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            count: 82,
            next: 'https://swapi.dev/api/people/?page=2',
            previous: null,
            results: [{
              name: 'Luke Skywalker',
              height: '172',
              mass: '77',
              birth_year: '19BBY',
              gender: 'male',
              url: 'https://swapi.dev/api/people/1/'
            }]
          })
        });
      }
    });

    await page.goto('/');
    
    // Wait for the character list to be visible first
    await page.waitForSelector('[data-testid="character-list"]', { timeout: 5000 });
    
    // Then wait for search input to be visible
    await page.waitForSelector('[data-testid="search-input"]', { timeout: 3000 });
    
    // Type into search input
    await page.getByTestId('search-input').fill('Luke');
    
    // Wait for search results
    await page.waitForSelector('[data-testid="character-list"]');
    
    // Verify search results
    const characterNames = await page.getByTestId('character-name').allTextContents();
    expect(characterNames.some(name => name.includes('Luke'))).toBeTruthy();
  });

  test('should navigate to character details', async ({ page }) => {
    // Mock the API responses for both list and details
    await page.route('**/api/people/**', async (route) => {
      const url = route.request().url();
      if (url.includes('/1')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            name: 'Luke Skywalker',
            height: '172',
            mass: '77',
            birth_year: '19BBY',
            gender: 'male',
            url: 'https://swapi.dev/api/people/1/'
          })
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            count: 1,
            results: [{
              name: 'Luke Skywalker',
              height: '172',
              mass: '77',
              birth_year: '19BBY',
              gender: 'male',
              url: 'https://swapi.dev/api/people/1/'
            }]
          })
        });
      }
    });

    await page.goto('/');
    
    // Click on the first character
    await page.waitForSelector('[data-testid="character-card"]');
    await page.getByTestId('character-card').first().click();
    
    // Verify we're on the details page
    await expect(page).toHaveURL(/.*\/character\/\d+/);
    await expect(page.getByTestId('character-details')).toBeVisible();
  });
}); 