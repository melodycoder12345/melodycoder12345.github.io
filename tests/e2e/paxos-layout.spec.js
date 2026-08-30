import { test, expect } from '@playwright/test';

test.describe('Paxos focused animation layout', () => {
  test('explains the problem before introducing protocol messages', async ({ page }) => {
    await page.goto('/distributed/paxos.html?embed=1');

    await expect(page.getByRole('heading', { name: '三个配置副本，要决定下一版配置是 X 还是 Y' })).toBeVisible();
    await expect(page.getByText('宁可暂时没有答案，也不能出现两个答案')).toBeVisible();
    await expect(page.getByText('结果：X 被选定')).toBeVisible();
    await expect(page.getByRole('heading', { name: '把 Paxos 放回一个真实的配置中心' })).toBeVisible();
    await expect(page.getByText('配置中心 Leader：发起提案')).toBeVisible();
    await expect(page.getByText('A1、A2、A3：保存配置的副本')).toBeVisible();
    await expect(page.getByRole('heading', { name: '当多个节点必须共同决定一件不能冲突的事' })).toBeVisible();
    await expect(page.getByText('实际项目很少手写单值 Paxos。', { exact: false })).toBeVisible();
    await expect(page.getByRole('heading', { name: '现在再看协议如何守住这个结果' })).toBeVisible();
  });

  test('uses a wide stage and reveals the timeline on demand', async ({ page }) => {
    await page.goto('/distributed/paxos.html?embed=1');

    const stage = page.locator('#stage');
    const timeline = page.locator('#stepList');
    const toggle = page.locator('#timelineToggle');

    await expect(stage).toBeVisible();
    expect((await stage.boundingBox())?.width).toBeGreaterThan(800);
    await expect(page.locator('#paxSvg')).toHaveAttribute('aria-label', 'Paxos 消息时序泳道图');
    await expect(page.locator('#paxSvg .lane-line')).toHaveCount(6);
    await expect(page.locator('#quorumText')).toHaveText('0 / 3');
    await expect(page.locator('.stage-toolbar')).toContainText('3 个接受者中至少 2 个接受');
    const stageBox = await stage.boundingBox();
    const quorumBox = await page.locator('#quorumMeter').boundingBox();
    expect(quorumBox && stageBox && quorumBox.y + quorumBox.height <= stageBox.y).toBeTruthy();
    await expect(timeline).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await toggle.click();
    await expect(timeline).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(timeline.locator('.step-btn')).toHaveCount(7);
  });

  test('updates the current explanation without expanding every step', async ({ page }) => {
    await page.goto('/distributed/paxos.html?embed=1');

    await expect(page.locator('#stepProgress')).toHaveText('1 / 7');
    const firstTitle = await page.locator('#stepTitle').textContent();
    await page.locator('#btnNext').click();
    await expect(page.locator('#stepProgress')).toHaveText('2 / 7');
    await expect(page.locator('#quorumText')).toHaveText('2 / 3');
    await expect(page.locator('#quorumMeter')).toHaveClass(/reached/);
    await expect(page.locator('#stepTitle')).not.toHaveText(firstTitle ?? '');
    await expect(page.locator('#stepList')).toBeHidden();
  });
});
