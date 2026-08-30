import { test, expect } from '@playwright/test';

test.describe('stage one LLM learning path', () => {
  test('makes the first lesson obvious before the optional topic library', async ({ page }) => {
    await page.goto('/ai/index.html');

    const firstLesson = page.getByRole('link', { name: /开始第一课：API 调用基础/ });
    await expect(firstLesson).toBeVisible();
    await expect(firstLesson).toHaveAttribute('href', 'api-basics.html');
    await expect(page.locator('.stage-step')).toHaveCount(4);
    await expect(page.getByRole('heading', { name: '进阶专题库' })).toBeVisible();
    await expect(page.locator('.topic-group')).toHaveCount(4);
  });

  test('presents four stages and reuses the existing first-stage pages', async ({ page }) => {
    await page.goto('/ai/llm-learning-path.html');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('大模型底层学习路线');
    await expect(page.locator('.route-stage')).toHaveCount(4);
    await expect(page.getByRole('link', { name: /API 调用基础/ })).toHaveAttribute('href', 'api-basics.html');
    await expect(page.getByRole('link', { name: /Prompt Engineering/ })).toHaveAttribute('href', 'prompt-engineering.html');
    await expect(page.getByRole('link', { name: /结构化输出/ })).toHaveAttribute('href', 'structured-output.html');
    await expect(page.locator('.route-stage').nth(0)).toHaveAttribute('open', '');
    await expect(page.locator('.route-stage').nth(1)).not.toHaveAttribute('open', '');
    await page.getByText('阶段二：理解 Transformer', { exact: true }).click();
    await expect(page.getByRole('link', { name: /向量与矩阵/ })).toHaveAttribute('href', 'vector-matrix-for-llm.html');
    await page.getByText('阶段三：从零实现 Mini GPT', { exact: true }).click();
    await expect(page.getByRole('link', { name: /Mini GPT 分步实验/ })).toHaveAttribute('href', 'mini-gpt.html');
    await page.getByText('阶段四：训练算法实验', { exact: true }).click();
    await expect(page.getByRole('link', { name: /训练优化实验室/ })).toHaveAttribute('href', 'training-optimization-lab.html');
    await expect(page.locator('.pf-help-title')).toBeVisible();
  });

  test('steps through success, failure and recovery in the caller-side API lifecycle', async ({ page }) => {
    await page.goto('/ai/api-basics.html');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('大模型 API 调用基础');
    await expect(page.locator('.step-btn')).toHaveCount(10);
    await expect(page.locator('#stateBadge')).toHaveText('request');

    await page.getByRole('button', { name: /限流：等待后再重试/ }).click();
    await expect(page.locator('#stateBadge')).toHaveText('429');
    await expect(page.locator('#node-recovery')).toHaveClass(/warn/);

    await page.getByRole('button', { name: /结构化结果校验失败/ }).click();
    await expect(page.locator('#node-validate')).toHaveClass(/bad/);

    await page.getByRole('button', { name: /有限重试、降级或人工处理/ }).click();
    await expect(page.locator('#stateBadge')).toHaveText('recovered');
    await expect(page.locator('#node-result')).toHaveClass(/good/);
    await expect(page.getByRole('link', { name: '推理与 KV Cache' })).toHaveAttribute('href', 'inference-kv-cache.html');
  });

  test('covers the mathematical boundary and recovery states', async ({ page }) => {
    await page.goto('/ai/vector-matrix-for-llm.html');
    await page.getByRole('button', { name: /维度不匹配/ }).click();
    await expect(page.locator('#stateBadge')).toHaveText('shape error');
    await expect(page.locator('#node-shape')).toHaveClass(/bad/);
    await page.getByRole('button', { name: /投影到相同维度/ }).click();
    await expect(page.locator('#node-matrix')).toHaveClass(/good/);

    await page.goto('/ai/softmax-cross-entropy.html');
    await page.getByRole('button', { name: /直接取指数可能溢出/ }).click();
    await expect(page.locator('#node-risk')).toHaveClass(/bad/);
    await page.getByRole('button', { name: /先减最大值/ }).click();
    await expect(page.locator('#stateBadge')).toHaveText('stable');

    await page.goto('/ai/gradient-backprop.html');
    await page.getByRole('button', { name: /学习率过大/ }).click();
    await expect(page.locator('#node-update')).toHaveClass(/bad/);
    await page.getByRole('button', { name: /裁剪异常大的梯度/ }).click();
    await expect(page.locator('#node-clip')).toHaveClass(/good/);
  });

  test('runs Mini GPT through shape failure and autoregressive generation', async ({ page }) => {
    await page.goto('/ai/mini-gpt.html');
    await expect(page.locator('.step-btn')).toHaveCount(10);
    await page.getByRole('button', { name: /序列超过 Block Size/ }).click();
    await expect(page.locator('#node-shape')).toHaveClass(/bad/);
    await page.getByRole('button', { name: /逐 Token 自回归生成/ }).click();
    await expect(page.locator('#node-generate')).toHaveClass(/good/);
    await expect(page.locator('#codeBlock')).toContainText('max_new');
  });

  test('updates the deterministic loss curve for failure and recovery cases', async ({ page }) => {
    await page.goto('/ai/training-optimization-lab.html');
    const curve = page.locator('#lossCurve');
    const stable = await curve.getAttribute('points');

    await page.getByRole('button', { name: /学习率过大/ }).click();
    await expect(page.locator('#stateBadge')).toHaveText('divergent');
    await expect(curve).not.toHaveAttribute('points', stable);

    await page.getByRole('button', { name: /梯度裁剪限制异常更新/ }).click();
    await expect(page.locator('#node-clip')).toHaveClass(/good/);
    await page.getByRole('button', { name: /训练下降、验证上升/ }).click();
    await expect(page.locator('#curveName')).toHaveText('验证 Loss 回升');
  });
});
