// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(resolve(here, '../../page-blocks.js'), 'utf8');

function load() {
  document.body.innerHTML = '<main id="content"></main>';
  delete window.PageBlocks;
  new Function('window', 'document', source)(window, document);
  return window.PageBlocks;
}

describe('PageBlocks', () => {
  let api;
  beforeEach(() => { api = load(); });

  it('renders the supported ordinary block types', () => {
    api.renderBlocks([
      { type: 'summary', title: '摘要', content: '一句话' },
      { type: 'article', title: '原理', content: '第一段\n\n第二段' },
      { type: 'concepts', items: [{ title: 'Query', content: '查询向量' }] },
      { type: 'comparison', columns: [{ key: 'a', label: '方案' }], rows: [{ a: 'A' }] },
      { type: 'code', language: 'js', code: 'const n = 1;' },
      { type: 'callout', tone: 'tip', title: '提示', content: '留意边界' },
      { type: 'relations' }
    ], '#content');

    expect(document.querySelectorAll('.page-block')).toHaveLength(7);
    expect(document.querySelectorAll('.page-block--article p')).toHaveLength(2);
    expect(document.querySelector('code').textContent).toBe('const n = 1;');
    expect(document.querySelector('.page-block--relations').textContent).toContain('关系数据加载后');
  });

  it('treats content as text instead of executable HTML', () => {
    api.renderBlocks([{ type: 'article', content: '<img src=x onerror="window.pwned=1"><script>bad()</script>' }], '#content');
    expect(document.querySelector('img')).toBeNull();
    expect(document.querySelector('script')).toBeNull();
    expect(document.querySelector('.page-block__paragraph').textContent).toContain('<img');
  });

  it('uses a registered interactive renderer', () => {
    api.registerInteractiveRenderer('demo', (data) => {
      const output = document.createElement('output');
      output.textContent = data.message;
      return output;
    });
    api.renderBlocks([{ type: 'interactive', renderer: 'demo', data: { message: 'ready' } }], '#content');
    expect(document.querySelector('output').textContent).toBe('ready');
  });

  it('shows a friendly fallback for an unavailable or broken interactive renderer', () => {
    api.renderBlocks([{ type: 'interactive', renderer: 'missing' }], '#content');
    expect(document.querySelector('.page-block--fallback').textContent).toContain('暂时不可用');

    api.registerInteractiveRenderer('broken', () => { throw new Error('boom'); });
    api.renderBlocks([{ type: 'interactive', renderer: 'broken', fallback: '演示加载失败' }], '#content');
    expect(document.querySelectorAll('.page-block--fallback')[1].textContent).toContain('演示加载失败');
  });

  it('supports relation rendering supplied by the page shell', () => {
    api.renderBlocks([{ type: 'relations', title: '关联' }], '#content', {
      renderRelations() {
        const list = document.createElement('ul');
        list.appendChild(document.createElement('li')).textContent = 'Attention → KV Cache';
        return list;
      }
    });
    expect(document.querySelector('.page-block--relations li').textContent).toContain('KV Cache');
  });

  it('ignores unknown blocks and validates the target', () => {
    api.renderBlocks([{ type: 'unknown', content: 'nope' }], '#content');
    expect(document.querySelector('.page-block')).toBeNull();
    expect(() => api.renderBlocks([], '#missing')).toThrow(/valid target/);
  });
});
