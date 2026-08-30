import { test, expect } from '@playwright/test';

const PAGES = [
  { path: '/',                     label: 'homepage'     },
  { path: '/golang/channel.html',  label: 'golang detail'},
  { path: '/cs/atomic.html',       label: 'cs detail'    },
  { path: '/golang/index.html',    label: 'golang index' },
  { path: '/cs/index.html',        label: 'cs index'     },
  { path: '/graph.html',           label: 'graph'        },
];

for (const { path, label } of PAGES) {
  test.describe(`nav.js on ${label} (${path})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(path);
      await page.waitForSelector('#__snav', { timeout: 5000 });
    });

    test('#__snav is injected and visible', async ({ page }) => {
      await expect(page.locator('#__snav')).toBeVisible();
    });

    test('body has padding-top set by nav.js', async ({ page }) => {
      const pt = await page.evaluate(() =>
        parseInt(window.getComputedStyle(document.body).paddingTop, 10)
      );
      expect(pt).toBeGreaterThan(0);
    });

    test('--snav-h CSS variable is 44px', async ({ page }) => {
      const h = await page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--snav-h').trim()
      );
      expect(h).toBe('44px');
    });
  });
}

test.describe('nav.js — body class assignment', () => {
  test('homepage gets sn-home-body class', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#__snav');
    await expect(page.locator('body')).toHaveClass(/sn-home-body/);
  });

  test('golang/channel.html gets sn-detail-body class', async ({ page }) => {
    await page.goto('/golang/channel.html');
    await page.waitForSelector('#__snav');
    await expect(page.locator('body')).toHaveClass(/sn-detail-body/);
  });

  test('golang/index.html gets sn-module-index-body class', async ({ page }) => {
    await page.goto('/golang/index.html');
    await page.waitForSelector('#__snav');
    await expect(page.locator('body')).toHaveClass(/sn-module-index-body/);
  });
});

test.describe('nav.js — breadcrumbs', () => {
  test('golang/channel.html shows "Golang" in breadcrumbs', async ({ page }) => {
    await page.goto('/golang/channel.html');
    await page.waitForSelector('#__snav');
    const crumbs = await page.locator('#snCrumbs').textContent();
    expect(crumbs).toContain('Golang');
  });

  test('cs/atomic.html shows "CS" or "组成" in breadcrumbs', async ({ page }) => {
    await page.goto('/cs/atomic.html');
    await page.waitForSelector('#__snav');
    const crumbs = await page.locator('#snCrumbs').textContent();
    expect(crumbs).toMatch(/CS|组成/);
  });

  test('root-level modern topics retain their owning module breadcrumb', async ({ page }) => {
    await page.goto('/modern-topic.html?id=tls-ech');
    await page.waitForSelector('#__snav');
    await expect(page.locator('#snCrumbs')).toContainText('网络');
    await expect(page.locator('#snCrumbs a').filter({ hasText: '网络' })).toHaveAttribute('href', 'network/index.html');
  });

  test('the obsolete BBR placeholder redirects to the meaningful congestion animation', async ({ page }) => {
    await page.goto('/modern-topic.html?id=bbr-v2');
    await page.waitForURL(/\/network\/tcp-congestion\.html#bbr$/);
    await expect(page.locator('#snCrumbs')).toContainText('网络');
    await expect(page.locator('#snCrumbs')).toContainText('TCP 拥塞控制');
  });
});

test.describe('nav.js — back link hiding', () => {
  test('golang/channel.html: local .back link is hidden by nav.js', async ({ page }) => {
    await page.goto('/golang/channel.html');
    await page.waitForSelector('#__snav');
    // The .back link (← 返回) on the page itself should be hidden
    const backLinks = await page.locator('.back').all();
    for (const link of backLinks) {
      if (await link.isVisible()) continue; // nav.js hides it with sn-hide-local-back
      const cls = await link.getAttribute('class');
      expect(cls).toContain('sn-hide-local-back');
    }
  });
});
