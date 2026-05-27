import { test, expect } from '@playwright/test';

// Helper: wait for page to be visually stable
async function waitStable(page, ms = 600) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(ms);
}

// Helper: wait for SVG to render in animation pages
async function waitSVG(page) {
  await page.waitForFunction(
    () => { const s = document.getElementById('svg'); return s && s.innerHTML.length > 50; },
    { timeout: 5000 }
  );
}

// ── Index Pages Layout ────────────────────────────────────────────────────────

test.describe('Visual: homepage', () => {
  test('homepage main content layout', async ({ page }) => {
    await page.goto('/');
    await waitStable(page);
    await expect(page.locator('main')).toHaveScreenshot('homepage-main.png');
  });
});

test.describe('Visual: golang/index.html', () => {
  test('three-section layout', async ({ page }) => {
    await page.goto('/golang/index.html');
    await waitStable(page);
    await expect(page.locator('main')).toHaveScreenshot('golang-index-main.png');
  });
});

test.describe('Visual: cs/index.html', () => {
  test('three-section layout', async ({ page }) => {
    await page.goto('/cs/index.html');
    await waitStable(page);
    await expect(page.locator('main')).toHaveScreenshot('cs-index-main.png');
  });
});

// ── Animation Pages Layout ────────────────────────────────────────────────────

test.describe('Visual: golang/channel.html', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/golang/channel.html');
    await waitSVG(page);
  });

  test('main-area three-column layout (critical: height must not be 0)', async ({ page }) => {
    // Hard assertion first — this is the key regression check
    const box = await page.locator('.main-area').boundingBox();
    expect(box.height, '.main-area height should be > 200px (CSS flex collapse bug guard)').toBeGreaterThan(200);
    // Visual snapshot
    await expect(page.locator('.main-area')).toHaveScreenshot('channel-main-area.png');
  });

  test('step 1 SVG diagram', async ({ page }) => {
    await expect(page.locator('.diagram-panel')).toHaveScreenshot('channel-diagram-step1.png');
  });

  test('step 2 SVG diagram (after 下一步)', async ({ page }) => {
    await page.click('#btnNext');
    await page.waitForTimeout(100);
    await expect(page.locator('.diagram-panel')).toHaveScreenshot('channel-diagram-step2.png');
  });

  test('steps panel with scenario tabs', async ({ page }) => {
    await expect(page.locator('.steps-panel')).toHaveScreenshot('channel-steps-panel.png');
  });

  test('extras section (面试题 + 易错点)', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);
    await expect(page.locator('.extras')).toHaveScreenshot('channel-extras.png');
  });
});

test.describe('Visual: cs/atomic.html', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cs/atomic.html');
    await waitSVG(page);
  });

  test('main-area layout', async ({ page }) => {
    const box = await page.locator('.main-area').boundingBox();
    expect(box.height).toBeGreaterThan(200);
    await expect(page.locator('.main-area')).toHaveScreenshot('cs-atomic-main-area.png');
  });

  test('step 1 SVG diagram', async ({ page }) => {
    await expect(page.locator('.diagram-panel')).toHaveScreenshot('cs-atomic-diagram-step1.png');
  });
});

// ── Navigation Bar ────────────────────────────────────────────────────────────

test.describe('Visual: nav bar', () => {
  test('nav bar on golang detail page', async ({ page }) => {
    await page.goto('/golang/channel.html');
    await page.waitForSelector('#__snav');
    await page.waitForTimeout(300);
    await expect(page.locator('#__snav')).toHaveScreenshot('snav-golang-detail.png');
  });

  test('nav bar on homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#__snav');
    await page.waitForTimeout(300);
    await expect(page.locator('#__snav')).toHaveScreenshot('snav-homepage.png');
  });
});

// ── Graph ─────────────────────────────────────────────────────────────────────

test.describe('Visual: graph.html', () => {
  test('knowledge graph canvas initial render', async ({ page }) => {
    await page.goto('/graph.html');
    await page.waitForSelector('canvas#graph');
    await page.waitForTimeout(1500); // let force simulation settle
    await expect(page.locator('canvas#graph')).toHaveScreenshot('graph-canvas.png', {
      maxDiffPixelRatio: 0.05, // canvas rendering has more variance
    });
  });
});
