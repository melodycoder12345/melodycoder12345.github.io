import { test, expect } from '@playwright/test';

const REPRESENTATIVE_PAGES = [
  { path: '/golang/channel.html', label: 'fullscreen animation' },
  { path: '/network/grpc.html', label: 'protocol lab' },
  { path: '/golang/json.html', label: 'long-form article' },
];

async function openFrameworkPage(page, path) {
  await page.goto(path);
  await expect(page.locator('#__snav')).toBeVisible();
  await expect(page.locator('body')).toHaveAttribute('data-pf-layout');
}

async function expectNoDocumentOverflow(page) {
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));

  expect(dimensions.document, JSON.stringify(dimensions)).toBeLessThanOrEqual(dimensions.viewport + 1);
  expect(dimensions.body, JSON.stringify(dimensions)).toBeLessThanOrEqual(dimensions.viewport + 1);
}

for (const viewport of [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 1024, height: 768 },
]) {
  test.describe(`${viewport.name} responsive layout`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const entry of REPRESENTATIVE_PAGES) {
      test(`${entry.label} has no document-level horizontal overflow`, async ({ page }) => {
        await openFrameworkPage(page, entry.path);
        await expectNoDocumentOverflow(page);
      });
    }
  });
}

test.describe('mobile controls and semantics', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('fullscreen animation controls remain reachable by keyboard', async ({ page }) => {
    await openFrameworkPage(page, '/golang/channel.html');

    const next = page.locator('#btnNext');
    await next.scrollIntoViewIfNeeded();
    await expect(next).toBeVisible();
    await next.focus();
    await expect(next).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#stepNum')).toHaveText('步骤 2');
  });

  test('protocol lab exposes a heading and reachable step controls', async ({ page }) => {
    await openFrameworkPage(page, '/network/grpc.html');

    const title = page.locator('h1.pf-help-title');
    await expect(title).toHaveCount(1);
    await expect(title).toHaveAttribute('aria-controls', '__learning-help');
    await expect(title).toHaveAttribute('aria-expanded', 'false');

    const secondStep = page.locator('.step-btn').nth(1);
    await secondStep.scrollIntoViewIfNeeded();
    await expect(secondStep).toBeVisible();
    await secondStep.click();
    await expect(secondStep).toHaveClass(/active/);
  });

  test('long-form runtime table of contents reports its expanded state', async ({ page }) => {
    await openFrameworkPage(page, '/golang/json.html');

    const navigation = page.locator('#__reading-navigation');
    const toggle = navigation.locator('.pf-reading-toggle');
    const toc = navigation.locator('#__reading-toc');
    await expect(navigation).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toc).toBeHidden();

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(toc).toBeVisible();

    await toc.locator('a').first().click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toc).toBeHidden();
  });
});

test.describe('tablet native article navigation', () => {
  test.use({ viewport: { width: 1024, height: 768 } });

  test('native side navigation has a labelled collapsible control', async ({ page }) => {
    await openFrameworkPage(page, '/golang/json.html');

    const navigation = page.locator('.side-nav');
    const toggle = navigation.locator('.pf-native-toc-toggle');
    await expect(navigation).toHaveAttribute('aria-label', '文章章节目录');
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(toggle).toHaveAttribute('aria-label', '收起文章目录');

    await toggle.click();
    await expect(navigation).toHaveClass(/is-collapsed/);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toHaveAttribute('aria-label', '展开文章目录');
  });
});
