import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, test } from 'vitest';

const root = process.cwd();

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function readJson(file) {
  return JSON.parse(read(file));
}

describe('stage one LLM learning path', () => {
  test('gives beginners one starting action before the grouped topic library', () => {
    const page = read('ai/index.html');

    expect(page).toContain('第一次来 · 从这里开始');
    expect(page).toContain('class="entry-primary" href="api-basics.html"');
    expect(page).toContain('id="mainline-title"');
    expect(page.match(/class="stage-step/g)).toHaveLength(4);
    expect(page.indexOf('使用大模型与 API')).toBeLessThan(page.indexOf('理解 Transformer'));
    expect(page.indexOf('理解 Transformer')).toBeLessThan(page.indexOf('从零实现 Mini GPT'));
    expect(page).toContain('id="library-title"');
    expect(page).toContain('理解模型原理');
    expect(page).toContain('构建大模型应用');
    expect(page).toContain('优化推理与上线');
    expect(page).toContain('探索扩展方向');
  });

  test('adds a staged route that reuses the existing first-stage concepts', () => {
    const page = read('ai/llm-learning-path.html');

    expect(page).toContain('<h1>大模型底层学习路线</h1>');
    expect(page).toContain('href="training-alignment.html#llm-overview"');
    expect(page).toContain('href="api-basics.html"');
    expect(page).toContain('href="prompt-engineering.html"');
    expect(page).toContain('href="context-length.html"');
    expect(page).toContain('href="structured-output.html"');
    expect(page).toContain('href="agent-tool-calling.html"');
    expect(page).toContain('阶段二');
    expect(page).toContain('阶段三');
    expect(page).toContain('阶段四');
    expect(page).toContain('href="vector-matrix-for-llm.html"');
    expect(page).toContain('href="softmax-cross-entropy.html"');
    expect(page).toContain('href="gradient-backprop.html"');
    expect(page).toContain('href="mini-gpt.html"');
    expect(page).toContain('href="training-optimization-lab.html"');
    expect(page.match(/<details class="route-stage"/g)).toHaveLength(4);
    expect(page.match(/<details class="route-stage"[^>]* open>/g)).toHaveLength(1);
    expect(page).not.toContain('已交付');
  });

  test('teaches the caller-side API lifecycle and its recovery paths', () => {
    const page = read('ai/api-basics.html');

    expect(page).toContain('<h1>大模型 API 调用基础</h1>');
    expect(page).toContain('API Key');
    expect(page).toContain('服务端');
    expect(page).toContain("kicker:'stream'");
    expect(page).toContain("kicker:'rate-limit'");
    expect(page).toContain("kicker:'timeout'");
    expect(page).toContain("kicker:'context-limit'");
    expect(page).toContain("kicker:'validation-failed'");
    expect(page).toContain("kicker:'recovery'");
    expect(page).toContain('href="inference-kv-cache.html"');
  });

  test('registers unique nodes and reviewed relationships without duplicating existing topics', () => {
    const nodes = readJson('knowledge/nodes/ai.json');
    const relations = readJson('knowledge/relations.json');
    const ids = nodes.map((node) => node.id);

    expect(ids.filter((id) => id === 'ai-llm-learning-path')).toHaveLength(1);
    expect(ids.filter((id) => id === 'ai-api-basics')).toHaveLength(1);
    expect(nodes.find((node) => node.id === 'ai-llm-learning-path')).toMatchObject({
      href: 'ai/llm-learning-path.html',
      level: 'beginner'
    });
    expect(nodes.find((node) => node.id === 'ai-api-basics')).toMatchObject({
      href: 'ai/api-basics.html',
      interaction: 'stepper'
    });

    const apiRelations = relations.filter((relation) =>
      relation.source === 'ai-api-basics' || relation.target === 'ai-api-basics'
    );
    expect(apiRelations.length).toBeGreaterThanOrEqual(4);
    expect(apiRelations.every((relation) => relation.status === 'reviewed')).toBe(true);
    expect(apiRelations.some((relation) => relation.target === 'ai-kv-cache')).toBe(true);
    expect(apiRelations.some((relation) => relation.target === 'ai-structured-output')).toBe(true);
  });

  test.each([
    ['ai/vector-matrix-for-llm.html', '面向大模型的向量与矩阵', ['dimension-mismatch', 'recovery']],
    ['ai/softmax-cross-entropy.html', 'Softmax 与交叉熵', ['overflow-risk', 'stable-softmax']],
    ['ai/gradient-backprop.html', '梯度与反向传播', ['large-learning-rate', 'gradient-clipping']],
    ['ai/mini-gpt.html', '从零实现 Mini GPT', ['shape-error', 'autoregressive-generation']],
    ['ai/training-optimization-lab.html', '训练优化实验室', ['divergent', 'overfitting', 'gradient-clipping']]
  ])('adds %s with required normal and boundary states', (file, title, states) => {
    const page = read(file);
    expect(page).toContain(`<h1>${title}</h1>`);
    expect(page).toContain('id="btnReset"');
    expect(page).toContain('id="btnPlay"');
    expect(page).toContain('id="btnNext"');
    for (const state of states) expect(page).toContain(`kicker:'${state}'`);
  });

  test('registers the delivered stage-two through stage-four pages as one concept owner each', () => {
    const nodes = readJson('knowledge/nodes/ai.json');
    const relations = readJson('knowledge/relations.json');
    const expected = [
      ['ai-vector-matrix', 'ai/vector-matrix-for-llm.html'],
      ['ai-softmax-cross-entropy', 'ai/softmax-cross-entropy.html'],
      ['ai-gradient-backprop', 'ai/gradient-backprop.html'],
      ['ai-mini-gpt', 'ai/mini-gpt.html'],
      ['ai-training-optimization-lab', 'ai/training-optimization-lab.html']
    ];

    for (const [id, href] of expected) {
      expect(nodes.filter((node) => node.id === id)).toHaveLength(1);
      expect(nodes.find((node) => node.id === id)).toMatchObject({ href });
      expect(relations.some((relation) => relation.source === id || relation.target === id)).toBe(true);
    }
  });
});
