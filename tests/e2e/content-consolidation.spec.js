import { test, expect } from '@playwright/test';

test.describe('content consolidation collections', () => {
  test('sorting keeps all eight animations behind one knowledge page', async ({ page }) => {
    await page.goto('/algo/sorting.html#quick-sort');

    await expect(page.getByRole('heading', { name: '排序算法' })).toBeVisible();
    await expect(page.locator('#demoTabs .dc-tab')).toHaveCount(9);
    await expect(page.locator('.dc-tab.active')).toHaveText('快速排序');

    const frame = page.frameLocator('#demoFrame');
    await expect(frame.locator('#btnNext')).toBeVisible();
    await page.getByRole('tab', { name: '归并排序' }).click();
    await expect(page).toHaveURL(/#merge-sort$/);
    await expect(frame.locator('#btnNext')).toBeVisible();
  });

  test('legacy standalone sorting URLs redirect to the matching animation', async ({ page }) => {
    await page.goto('/algo/bubble-sort.html');
    await expect(page).toHaveURL(/\/algo\/sorting\.html#bubble-sort$/);
    await expect(page.locator('.dc-tab.active')).toHaveText('冒泡排序');
  });

  test('consensus prioritizes Raft while preserving the Paxos animation', async ({ page }) => {
    await page.goto('/distributed/consensus.html#paxos');
    await expect(page.getByRole('heading', { name: '分布式共识与 etcd' })).toBeVisible();
    await expect(page.locator('#demoTabs .dc-tab')).toHaveCount(2);
    await expect(page.locator('.dc-tab.active')).toContainText('Paxos');
    await expect(page.frameLocator('#demoFrame').locator('#btnNext')).toBeVisible();
  });

  test('legacy Paxos URL now resolves to the consensus collection', async ({ page }) => {
    await page.goto('/distributed/paxos.html');
    await expect(page).toHaveURL(/\/distributed\/consensus\.html#paxos$/);
  });

  test('distributed transaction protocols share one decision-oriented page', async ({ page }) => {
    await page.goto('/distributed/transactions.html#saga');
    await expect(page.getByRole('heading', { name: '分布式事务模式' })).toBeVisible();
    await expect(page.locator('#demoTabs .dc-tab')).toHaveCount(3);
    await expect(page.locator('.dc-tab.active')).toContainText('Saga');
    await expect(page.frameLocator('#demoFrame').locator('#btnNext')).toBeVisible();
  });

  test('tracing concepts and OpenTelemetry share one operational page', async ({ page }) => {
    await page.goto('/observability/tracing-platform.html#otel');
    await expect(page.getByRole('heading', { name: '分布式追踪与 OpenTelemetry' })).toBeVisible();
    await expect(page.locator('#demoTabs .dc-tab')).toHaveCount(3);
    await expect(page.frameLocator('#demoFrame').locator('#playBtn')).toBeVisible();
  });

  test('system design collections preserve search and media animations', async ({ page }) => {
    await page.goto('/system-design/search-platform.html#suggest');
    await expect(page.locator('#demoTabs .dc-tab')).toHaveCount(2);
    await expect(page.frameLocator('#demoFrame').locator('#btnNext')).toBeVisible();

    await page.goto('/system-design/media-platform.html#live');
    await expect(page.locator('#demoTabs .dc-tab')).toHaveCount(2);
    await expect(page.frameLocator('#demoFrame').locator('#btnNext')).toBeVisible();
  });

  test('AI lifecycle collections retain training, serving, and multimodal demos', async ({ page }) => {
    await page.goto('/ai/training-alignment.html#rlhf');
    await expect(page.locator('#demoTabs .dc-tab')).toHaveCount(4);
    await expect(page.locator('.dc-tab.active')).toHaveAttribute('data-demo', 'rlhf');

    await page.goto('/ai/inference-serving.html#speculative-decoding');
    await expect(page.locator('#demoTabs .dc-tab')).toHaveCount(4);
    await expect(page.frameLocator('#demoFrame').locator('body')).toBeVisible();

    await page.goto('/ai/multimodal-generation.html#diffusion');
    await expect(page.locator('#demoTabs .dc-tab')).toHaveCount(2);
  });

  test('algorithm families use one decision page without losing their animations', async ({ page }) => {
    const collections = [
      ['/algo/search-trees.html#red-black-tree', 4],
      ['/algo/shortest-paths.html#bellman-ford', 3],
      ['/algo/minimum-spanning-trees.html#prim', 2],
      ['/algo/dynamic-programming.html#interval-dp', 5]
    ];
    for (const [url, count] of collections) {
      await page.goto(url);
      await expect(page.locator('#demoTabs .dc-tab')).toHaveCount(count);
      await expect(page.frameLocator('#demoFrame').locator('body')).toBeVisible();
    }
  });

  test('distributed theory is grouped by architecture decision', async ({ page }) => {
    await page.goto('/distributed/consistency-tradeoffs.html#base');
    await expect(page.locator('#demoTabs .dc-tab')).toHaveCount(2);
    await expect(page.locator('.dc-tab.active')).toContainText('BASE');

    await page.goto('/distributed/conflict-convergence.html#vector-clock');
    await expect(page.locator('#demoTabs .dc-tab')).toHaveCount(2);
    await expect(page.frameLocator('#demoFrame').locator('body')).toBeVisible();
  });

  test('second-batch legacy URLs redirect to their collection anchors', async ({ page }) => {
    await page.goto('/algo/dijkstra.html');
    await expect(page).toHaveURL(/\/algo\/shortest-paths\.html#dijkstra$/);
    await page.goto('/ai/rlhf.html');
    await expect(page).toHaveURL(/\/ai\/training-alignment\.html#rlhf$/);
    await page.goto('/distributed/crdt.html');
    await expect(page).toHaveURL(/\/distributed\/conflict-convergence\.html#crdt$/);
  });

  test('remaining merge queue is represented by collections instead of standalone entries', async ({ page }) => {
    await page.goto('/algo/problem-solving-strategies.html#backtracking');
    await expect(page.locator('#demoTabs .dc-tab')).toHaveCount(2);
    await expect(page.frameLocator('#demoFrame').locator('body')).toBeVisible();

    await page.goto('/algo/divide-conquer.html');
    await expect(page).toHaveURL(/\/algo\/sorting\.html#divide-conquer$/);

    await page.goto('/cs/number-computing.html#bit-manipulation');
    await expect(page.locator('#demoTabs .dc-tab')).toHaveCount(2);
    await expect(page.frameLocator('#demoFrame').locator('body')).toBeVisible();
  });
});
