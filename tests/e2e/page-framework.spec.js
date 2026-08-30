import { test, expect } from '@playwright/test';

test.describe('title learning help', () => {
  test('shows detailed learning context when hovering the page title', async ({ page }) => {
    await page.goto('/ai/transformer-attention.html');

    const title = page.locator('.pf-help-title');
    const popover = page.locator('.pf-help-popover');
    await expect(title).toBeVisible();
    await expect(page.locator('.pf-help-trigger')).toHaveCount(0);
    await title.hover();
    await expect(popover).toBeVisible();
    await expect(popover).toContainText('学习目标');
    await expect(popover).toContainText('知识关系');
    await expect(page.locator('#__learning-drawer')).toHaveCount(0);
    await expect(page.locator('#__learning-guide')).toHaveCount(0);

    await expect(page.locator('#__page-blocks')).toContainText('学完自检');
  });

  test('keeps a legacy animation layout intact', async ({ page }) => {
    await page.goto('/db/buffer-pool.html');

    await expect(page.locator('.pf-help-title')).toBeVisible();
    await expect(page.locator('.main')).toBeVisible();

    const bodyOverflow = await page.locator('body').evaluate(element => getComputedStyle(element).overflowY);
    expect(bodyOverflow).toBe('hidden');
  });

  test('pins the popover on click and closes it with Escape', async ({ page }) => {
    await page.goto('/redis/persistence.html');
    const title = page.locator('.pf-help-title');
    const popover = page.locator('.pf-help-popover');
    await title.click();
    await expect(popover).toBeVisible();
    await expect(popover.locator('.pf-help-relation')).toHaveCount(2);
    await page.keyboard.press('Escape');
    await expect(popover).not.toBeVisible();
    await expect(title).toBeFocused();
  });
});
