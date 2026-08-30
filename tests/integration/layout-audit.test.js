import { describe, expect, it } from 'vitest';
import { auditLayouts } from '../../scripts/layout-audit.js';

describe('repository layout audit', () => {
  const pages = auditLayouts();
  const byHref = new Map(pages.map(page => [page.href, page]));

  it('covers all structured detail pages without missing profiles', () => {
    expect(pages.length).toBeGreaterThan(100);
    expect(pages.flatMap(page => page.issues).filter(issue => issue.code === 'missing-profile')).toEqual([]);
  });

  it('recognizes representative historical template families', () => {
    expect(byHref.get('algo/dijkstra.html')?.templates).toEqual(expect.arrayContaining(['fullscreen', 'viz-code']));
    expect(byHref.get('network/grpc.html')?.templates).toEqual(expect.arrayContaining(['hero', 'lab']));
    expect(byHref.get('network/quic.html')?.titleStructure).toBe('hero');
  });

  it('recognizes existing visual titles across article and fullscreen templates', () => {
    for (const href of ['golang/type-system.html', 'system-design/short-url.html']) {
      const page = byHref.get(href);
      expect(page?.titleStructure).toMatch(/^(content|semantic-fallback)$/);
      if (page?.titleStructure === 'semantic-fallback') {
        expect(page.issues.map(issue => issue.code)).toContain('semantic-title-fallback');
      }
    }
    expect(pages.some(page => page.issues.some(issue => issue.code === 'missing-page-title'))).toBe(false);
  });

  it('keeps conservative responsive-risk metrics available for repository review', () => {
    for (const page of pages) {
      expect(page.metrics).toEqual(expect.objectContaining({
        wideGridWithoutBreakpoint: expect.any(Boolean),
        controlBarOverflowRisk: expect.any(Boolean),
        unboundedGraphicRisk: expect.any(Boolean),
        wideContentRisk: expect.any(Boolean),
      }));
    }
    expect(pages.filter(page => page.issues.some(issue => issue.code === 'control-bar-overflow-risk')).length).toBeLessThan(20);
    expect(pages.filter(page => page.issues.some(issue => issue.code === 'unbounded-graphic-risk')).length).toBeLessThan(20);
    expect(pages.filter(page => page.issues.some(issue => issue.code === 'wide-content-overflow-risk')).length).toBeLessThan(20);
  });

  it('accounts for native and globally generated reading navigation', () => {
    const longPages = pages.filter(page => page.issues.some(issue => issue.code === 'long-content'));
    expect(longPages.length).toBeGreaterThan(0);
    expect(longPages.some(page => page.metrics.tocSource === 'native')).toBe(true);
    expect(longPages.some(page => page.metrics.tocSource === 'runtime')).toBe(true);
    for (const page of longPages) {
      expect(page.metrics).toEqual(expect.objectContaining({
        loadsGlobalFramework: expect.any(Boolean),
        runtimeTocEligible: expect.any(Boolean),
        tocSource: expect.stringMatching(/^(native|runtime|none)$/),
      }));
      if (page.metrics.tocSource !== 'none') {
        expect(page.issues.map(issue => issue.code)).not.toContain('long-content-without-toc');
      }
    }
  });
});
