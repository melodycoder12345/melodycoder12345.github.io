import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test, expect } from '@playwright/test';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const NODE_DIRECTORY = path.join(ROOT, 'knowledge/nodes');

const animationPages = fs.readdirSync(NODE_DIRECTORY)
  .filter((name) => name.endsWith('.json'))
  .flatMap((name) => JSON.parse(fs.readFileSync(path.join(NODE_DIRECTORY, name), 'utf8')))
  .filter((node) => node.type === 'page'
    && (node.interaction !== 'none' || node.presentations?.includes('animation')))
  .sort((left, right) => left.href.localeCompare(right.href));

const CONTROL_SELECTORS = {
  initialize: [
    '#goBtn',
    '#btnUnion',
    'button[onclick*="initAlgo" i]',
    'button[onclick*="doInsert" i]',
    'button[onclick*="doPut" i]',
  ].join(', '),
  next: [
    '#btnNext',
    '#btn-next',
    'button[onclick*="next" i]',
    'button[onclick*="stepNext" i]',
  ].join(', '),
  play: [
    '#btnPlay',
    '#btn-play',
    '#playBtn',
    '#play',
    'button[onclick*="togglePlay" i]',
  ].join(', '),
  reset: [
    '#btnReset',
    '#btn-reset',
    'button[onclick*="reset" i]',
  ].join(', '),
};

const IGNORED_CONSOLE_ERRORS = [
  // Browser extensions and unavailable developer tools are outside the page.
  /chrome-extension:\/\//i,
  /devtools/i,
  // Chromium does not include the missing resource URL in this duplicate
  // console entry. The response listener below validates the actual URL.
  /^Failed to load resource: the server responded with a status of 404 \(File not found\)$/,
];

async function firstUsableControl(page, selector) {
  const controls = page.locator(selector);
  for (let index = 0; index < await controls.count(); index += 1) {
    const control = controls.nth(index);
    if (await control.isVisible() && await control.isEnabled()) return control;
  }
  return null;
}

async function captureInteractiveState(page) {
  return page.evaluate(() => {
    const controls = [...document.querySelectorAll('button, input, select')].map((element) => ({
      id: element.id,
      text: element.textContent?.trim(),
      value: element.value,
      className: element.className,
      disabled: element.disabled,
    }));
    const surfaces = [...document.querySelectorAll([
      'svg',
      'canvas',
      '.stage',
      '.visualization',
      '.diagram',
      '.main-area',
      '.animation-area',
      '[id*="stage" i]',
      '[id*="canvas" i]',
      '[id*="step" i]',
    ].join(', '))].slice(0, 20).map((element) => {
      if (element instanceof HTMLCanvasElement) {
        try {
          return `${element.id}:canvas:${element.toDataURL()}`;
        } catch {
          return `${element.id}:canvas:${element.width}x${element.height}`;
        }
      }
      return `${element.id}:${element.className}:${element.innerHTML}`;
    });

    return JSON.stringify({ controls, surfaces, body: document.body.innerHTML });
  });
}

test.describe('all structured animation and interactive pages', () => {
  test.describe.configure({ mode: 'parallel' });

  for (const node of animationPages) {
    test(`${node.href} loads and its controls update observable state`, async ({ page }) => {
      const runtimeErrors = [];
      const failedLocalResponses = [];

      page.on('pageerror', (error) => runtimeErrors.push(`pageerror: ${error.message}`));
      page.on('console', (message) => {
        if (message.type() !== 'error') return;
        const text = message.text();
        if (!IGNORED_CONSOLE_ERRORS.some((pattern) => pattern.test(text))) {
          runtimeErrors.push(`console: ${text}`);
        }
      });
      page.on('response', (response) => {
        const url = new URL(response.url());
        if (url.origin === 'http://localhost:3000'
          && url.pathname !== '/favicon.ico'
          && response.status() >= 400) {
          failedLocalResponses.push(`${response.status()} ${url.pathname}`);
        }
      });

      const response = await page.goto(`/${node.href}`, { waitUntil: 'domcontentloaded' });
      expect(response?.status(), 'document should load successfully').toBe(200);
      await expect(page.locator('body')).toBeVisible();
      await page.waitForTimeout(250);

      const embeddedFrame = page.locator('iframe[data-demo-frame]');
      const interactionPage = await embeddedFrame.count()
        ? page.frames().find((frame) => frame.url().includes('embed=1')) || page
        : page;

      // Operation-driven visualizers (for example stack/tree pages) do not
      // create a step sequence until their primary operation is submitted.
      const initialize = await firstUsableControl(interactionPage, CONTROL_SELECTORS.initialize);
      if (initialize) {
        await initialize.click();
        await page.waitForTimeout(100);
      }

      const before = await captureInteractiveState(interactionPage);
      const attemptedActions = [];
      let stateChanged = false;

      const next = await firstUsableControl(interactionPage, CONTROL_SELECTORS.next);
      if (next) {
        attemptedActions.push('next');
        await next.click();
        await page.waitForTimeout(100);
        stateChanged = (await captureInteractiveState(interactionPage)) !== before;
      }

      if (!stateChanged) {
        const play = await firstUsableControl(interactionPage, CONTROL_SELECTORS.play);
        if (play) {
          attemptedActions.push('play');
          await play.click();
          await page.waitForTimeout(300);
          stateChanged = (await captureInteractiveState(interactionPage)) !== before;
          if (await play.isVisible() && await play.isEnabled()) await play.click();
        }
      }

      const reset = await firstUsableControl(interactionPage, CONTROL_SELECTORS.reset);
      if (reset) {
        attemptedActions.push('reset');
        await reset.click();
        await page.waitForTimeout(50);
      }

      // Some collection entries are explanatory visual pages rather than
      // steppers. In that case the collection's tab switch is the supported
      // interaction and must replace the embedded document observably.
      if (!stateChanged && await embeddedFrame.count()) {
        const demoTabs = page.locator('#demoTabs .dc-tab');
        if (await demoTabs.count() > 1) {
          const previousFrameUrl = interactionPage.url();
          attemptedActions.push('demo-tab');
          await demoTabs.nth(1).click();
          await page.waitForTimeout(250);
          const nextFrame = page.frames().find((frame) => frame.url().includes('embed=1'));
          stateChanged = Boolean(nextFrame && nextFrame.url() !== previousFrameUrl);
        }
      }

      expect(attemptedActions, 'interactive metadata requires a usable next/play/reset control')
        .not.toHaveLength(0);
      expect(stateChanged, `none of these actions changed visible interactive state: ${attemptedActions.join(', ')}`)
        .toBe(true);
      expect(failedLocalResponses, 'page requested missing or broken local resources').toEqual([]);
      expect(runtimeErrors, 'page emitted JavaScript errors while loading or interacting').toEqual([]);
    });
  }
});
