import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { analyzeHtml, READING_NAVIGATION_CONTRACT, summarize } from '../../scripts/layout-audit.js';

const profile = {
  id: 'sample',
  presentations: ['article'],
  interaction: 'none',
};

describe('layout audit', () => {
  it('recognizes a hero lab and reports stale profile metadata', () => {
    const result = analyzeHtml(`
      <main>
        <section class="hero"><h1>协议实验</h1></section>
        <section class="lab"><div class="viz"></div><button id="btnNext">下一步</button><button id="btnReset">重置</button></section>
      </main>
    `, profile, 'network/sample.html');

    expect(result.titleStructure).toBe('hero');
    expect(result.templates).toEqual(['hero', 'lab']);
    expect(result.signals.interactive).toBe(true);
    expect(result.issues.map(issue => issue.code)).toEqual(expect.arrayContaining([
      'interaction-mismatch', 'presentation-mismatch', 'visual-mismatch',
    ]));
  });

  it('recognizes fullscreen viz-code pages without changing their markup', () => {
    const result = analyzeHtml(`
      <style>.main-area { height: calc(100vh - 48px) }</style>
      <header><h1>最短路径</h1></header>
      <div class="main-area"><div class="viz-panel"></div><div class="code-panel"></div></div>
    `, { ...profile, presentations: ['animation', 'code'], interaction: 'stepper' });

    expect(result.titleStructure).toBe('title-bar');
    expect(result.templates).toEqual(['fullscreen', 'viz-code']);
    expect(result.issues).toEqual([]);
  });

  it('reports a semantic fallback when an existing title class is credible', () => {
    const result = analyzeHtml('<main><span class="nav-title">旧标题</span></main>');
    expect(result.title).toBe('旧标题');
    expect(result.titleStructure).toBe('semantic-fallback');
    expect(result.issues.map(issue => issue.code)).toEqual(['semantic-title-fallback', 'missing-profile']);
  });

  it('keeps a warning when no credible page title exists', () => {
    const result = analyzeHtml('<main><span class="label">普通标签</span></main>', profile);
    expect(result.titleStructure).toBe('missing');
    expect(result.issues.map(issue => issue.code)).toContain('missing-page-title');
  });

  it('reuses a fullscreen lab panel heading as the semantic page title', () => {
    const result = analyzeHtml(`
      <div class="layout">
        <aside><div class="sp-head"><div class="sp-title">短链系统</div></div></aside>
        <div class="viz-panel"></div>
      </div>
    `, profile);
    expect(result.title).toBe('短链系统');
    expect(result.titleStructure).toBe('semantic-fallback');
    expect(result.issues.map(issue => issue.code)).not.toContain('missing-page-title');
  });

  it('reports long content without a table of contents conservatively', () => {
    const sections = Array.from({ length: 7 }, (_, index) => `<h2>章节 ${index}</h2><p>${'正文'.repeat(600)}</p>`).join('');
    const result = analyzeHtml(`<main><h1>长文</h1>${sections}</main>`, profile);
    expect(result.metrics.bodyTextLength).toBeGreaterThan(7000);
    expect(result.issues.map(issue => issue.code)).toEqual(expect.arrayContaining(['long-content', 'long-content-without-toc']));

    const withToc = analyzeHtml(`<nav class="toc">目录</nav><main><h1>长文</h1>${sections}</main>`, profile);
    expect(withToc.issues.map(issue => issue.code)).not.toContain('long-content-without-toc');
  });

  it('recognizes native side navigation and qualified runtime navigation separately', () => {
    const sections = Array.from({ length: 7 }, (_, index) => `<h2>章节 ${index}</h2><p>${'正文'.repeat(600)}</p>`).join('');
    const native = analyzeHtml(`<aside class="side-nav"></aside><main><h1>长文</h1>${sections}</main>`, profile);
    expect(native.metrics).toMatchObject({ hasToc: true, tocSource: 'native', runtimeTocEligible: false });
    expect(native.issues.map(issue => issue.code)).not.toContain('long-content-without-toc');

    const runtime = analyzeHtml(`<script src="../nav.js"></script><main><h1>长文</h1>${sections}</main>`, profile);
    expect(runtime.metrics).toMatchObject({ hasToc: false, loadsGlobalFramework: true, runtimeTocEligible: true, tocSource: 'runtime' });
    expect(runtime.issues.map(issue => issue.code)).toContain('long-content');
    expect(runtime.issues.map(issue => issue.code)).not.toContain('long-content-without-toc');
  });

  it('does not infer runtime navigation without the loader or for excluded lab layouts', () => {
    const sections = Array.from({ length: 7 }, (_, index) => `<h2>章节 ${index}</h2><p>${'正文'.repeat(600)}</p>`).join('');
    const withoutLoader = analyzeHtml(`<main><h1>长文</h1>${sections}</main>`, profile);
    expect(withoutLoader.metrics.runtimeTocEligible).toBe(false);
    expect(withoutLoader.issues.map(issue => issue.code)).toContain('long-content-without-toc');

    const lab = analyzeHtml(`<script src="../nav.js"></script><main><section class="hero"><h1>实验</h1></section><section class="lab">${sections}</section></main>`, profile);
    expect(lab.metrics.runtimeTocEligible).toBe(false);
    expect(lab.issues.map(issue => issue.code)).toContain('long-content-without-toc');
  });

  it('keeps the audit contract aligned with shared reading tools', () => {
    const source = readFileSync(new URL('../../page-framework.js', import.meta.url), 'utf8');
    expect(source).toContain(`length < ${READING_NAVIGATION_CONTRACT.minChars}`);
    expect(source).toContain(`headings.length < ${READING_NAVIGATION_CONTRACT.minHeadings}`);
    for (const value of [
      READING_NAVIGATION_CONTRACT.navigationId,
      READING_NAVIGATION_CONTRACT.progressId,
      READING_NAVIGATION_CONTRACT.backTopId,
      READING_NAVIGATION_CONTRACT.nativeToggleClass,
    ]) expect(source).toContain(value);
    expect(source).toContain("setAttribute('role', 'progressbar')");
    expect(source).toContain("setAttribute('aria-expanded', String(!collapsed))");
    expect(source).toContain("window.scrollTo({ top: 0");
  });

  it('reports fixed wide content and unresponsive three-column grids', () => {
    const result = analyzeHtml(`
      <style>.content { min-width: 1440px; display:grid; grid-template-columns:280px 1fr 360px; }</style>
      <main class="content"><h1>宽布局</h1></main>
    `, profile);
    expect(result.metrics.fixedWideLayout).toBe(true);
    expect(result.metrics.wideGridWithoutBreakpoint).toBe(true);
    expect(result.issues.map(issue => issue.code)).toEqual(expect.arrayContaining(['fixed-wide-layout', 'wide-grid-without-breakpoint']));
  });

  it('requires concrete narrow-screen evidence for a three-column layout', () => {
    const stillThreeColumns = analyzeHtml(`
      <style>
        .layout { display:grid; grid-template-columns:240px 1fr 320px; }
        @media (max-width: 800px) { .layout { grid-template-columns:160px 1fr 220px; } }
      </style><main class="layout"><h1>三列</h1></main>
    `, profile);
    expect(stillThreeColumns.metrics.wideGridWithoutBreakpoint).toBe(true);

    const stacked = analyzeHtml(`
      <style>
        .layout { display:grid; grid-template-columns:240px 1fr 320px; }
        @media (max-width: 800px) { .layout { grid-template-columns:1fr; } }
      </style><main class="layout"><h1>单列</h1></main>
    `, profile);
    expect(stacked.metrics.wideGridWithoutBreakpoint).toBe(false);
  });

  it('reports only strong control and graphic overflow signals', () => {
    const result = analyzeHtml(`
      <style>
        .controls { display:flex; flex-wrap:nowrap; }
        canvas { width: 960px; }
      </style>
      <main><h1>实验</h1><div class="controls"><button>1</button><button>2</button><button>3</button><button>4</button></div><canvas width="960"></canvas></main>
    `, profile);
    expect(result.issues.map(issue => issue.code)).toEqual(expect.arrayContaining([
      'control-bar-overflow-risk', 'unbounded-graphic-risk',
    ]));

    const protectedResult = analyzeHtml(`
      <style>.controls { display:flex; flex-wrap:wrap; } svg { width:900px; max-width:100%; }</style>
      <main><h1>实验</h1><div class="controls"><button>1</button><button>2</button><button>3</button><button>4</button></div><svg width="900"></svg></main>
    `, profile);
    expect(protectedResult.issues.map(issue => issue.code)).not.toEqual(expect.arrayContaining([
      'control-bar-overflow-risk', 'unbounded-graphic-risk',
    ]));
  });

  it('reports explicitly wide code or tables only when no overflow escape exists', () => {
    const risky = analyzeHtml('<style>pre { min-width: 900px; }</style><main><h1>代码</h1><pre><code>x</code></pre></main>', { ...profile, presentations: ['article', 'code'] });
    expect(risky.metrics.wideContentRisk).toBe(true);
    expect(risky.issues.map(issue => issue.code)).toContain('wide-content-overflow-risk');

    const protectedResult = analyzeHtml('<style>pre { min-width:900px; overflow-x:auto; }</style><main><h1>代码</h1><pre><code>x</code></pre></main>', { ...profile, presentations: ['article', 'code'] });
    expect(protectedResult.metrics.wideContentRisk).toBe(false);
  });

  it('summarizes templates title structures and issue severity', () => {
    const results = [
      analyzeHtml('<main><h1>文章</h1></main>', profile),
      analyzeHtml('<main class="hero"><h1>Hero</h1></main>', profile),
      analyzeHtml('<main></main>', profile),
    ];
    expect(summarize(results)).toMatchObject({
      counts: { pages: 3, warnings: 1 },
      templates: { article: 2, hero: 1 },
      titleStructures: { content: 1, hero: 1, missing: 1 },
    });
  });
});
