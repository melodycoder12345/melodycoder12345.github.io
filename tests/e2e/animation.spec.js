import { test, expect } from '@playwright/test';

// Test two representative animation pages
const PAGES = [
  { path: '/golang/channel.html', name: 'golang/channel' },
  { path: '/cs/atomic.html',      name: 'cs/atomic'      },
];

for (const { path, name } of PAGES) {
  test.describe(`Animation page: ${name}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(path);
      // Wait for SVG to be rendered (first scenario auto-rendered)
      await page.waitForFunction(() => {
        const svg = document.getElementById('svg');
        return svg && svg.innerHTML.length > 50;
      }, { timeout: 5000 });
    });

    test('main-area is visible with height > 200px', async ({ page }) => {
      const box = await page.locator('.main-area').boundingBox();
      expect(box).not.toBeNull();
      expect(box.height).toBeGreaterThan(200);
    });

    test('first step is shown on load — stepNum = "步骤 1"', async ({ page }) => {
      await expect(page.locator('#stepNum')).toHaveText('步骤 1');
    });

    test('SVG is non-empty after load', async ({ page }) => {
      const svg = page.locator('#svg');
      await expect(svg).not.toBeEmpty();
    });

    test('code panel has content', async ({ page }) => {
      const body = page.locator('#codeBody');
      await expect(body).not.toBeEmpty();
    });

    test('scenario tabs are rendered', async ({ page }) => {
      const tabs = page.locator('#scenarios .sc-btn');
      const count = await tabs.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });

    test('clicking 下一步 advances to step 2', async ({ page }) => {
      await page.click('#btnNext');
      await expect(page.locator('#stepNum')).toHaveText('步骤 2');
    });

    test('clicking 下一步 updates SVG content', async ({ page }) => {
      const svgBefore = await page.locator('#svg').innerHTML();
      await page.click('#btnNext');
      await page.waitForTimeout(100);
      const svgAfter = await page.locator('#svg').innerHTML();
      expect(svgAfter).not.toBe(svgBefore);
    });

    test('⏮ 重置 button resets to step 1', async ({ page }) => {
      await page.click('#btnNext');
      await page.click('#btnNext');
      await page.click('#btnReset');
      await expect(page.locator('#stepNum')).toHaveText('步骤 1');
    });

    test('← 上一步 is disabled on step 1', async ({ page }) => {
      await expect(page.locator('#btnPrev')).toBeDisabled();
    });

    test('switching to second scenario tab resets to step 1', async ({ page }) => {
      // Advance a few steps first
      await page.click('#btnNext');
      await page.click('#btnNext');
      // Click second scenario tab
      const secondTab = page.locator('#scenarios .sc-btn').nth(1);
      await secondTab.click();
      await expect(page.locator('#stepNum')).toHaveText('步骤 1');
    });

    test('stepping through all steps reaches the last step (btnNext disabled)', async ({ page }) => {
      // Click next until disabled
      for (let i = 0; i < 20; i++) {
        const disabled = await page.locator('#btnNext').isDisabled();
        if (disabled) break;
        await page.click('#btnNext');
      }
      await expect(page.locator('#btnNext')).toBeDisabled();
    });

    test('code panel has at least one highlighted line (.cl.hi)', async ({ page }) => {
      const hiLines = page.locator('#codeBody .cl.hi');
      const count = await hiLines.count();
      expect(count).toBeGreaterThan(0);
    });

    test('flow-nav dots reflect current step', async ({ page }) => {
      // On step 1, first dot should have "cur" class
      const firstDot = page.locator('#flowNav .fn-dot').first();
      await expect(firstDot).toHaveClass(/cur/);
      await page.click('#btnNext');
      // After next, first dot should be "done"
      await expect(firstDot).toHaveClass(/done/);
    });
  });
}
