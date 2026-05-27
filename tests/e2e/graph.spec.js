import { test, expect } from '@playwright/test';

test.describe('graph.html — knowledge graph', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/graph.html');
    // Wait for canvas to be present and have dimensions
    await page.waitForSelector('canvas#graph', { timeout: 8000 });
    await page.waitForTimeout(800); // allow force simulation to settle
  });

  test('canvas#graph is visible and has non-zero dimensions', async ({ page }) => {
    const canvas = page.locator('canvas#graph');
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    expect(box.width).toBeGreaterThan(100);
    expect(box.height).toBeGreaterThan(100);
  });

  test('search box is present and interactive', async ({ page }) => {
    const search = page.locator('#search');
    await expect(search).toBeVisible();
    await search.fill('goroutine');
    await expect(search).toHaveValue('goroutine');
  });

  test('filter buttons are present', async ({ page }) => {
    const filters = page.locator('#filters');
    await expect(filters).toBeVisible();
    const buttons = filters.locator('button, .filter-btn, [data-module]');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('#__snav is injected', async ({ page }) => {
    await expect(page.locator('#__snav')).toBeVisible();
  });

  test('page title contains 知识 or 星图', async ({ page }) => {
    const title = await page.title();
    expect(title).toMatch(/知识|星图|graph/i);
  });
});
