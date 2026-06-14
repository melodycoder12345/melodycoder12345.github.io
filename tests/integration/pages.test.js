import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');

// All animation pages (have SCENARIOS)
const ANIMATION_PAGES = [
  'golang/channel.html', 'golang/concurrent-patterns.html', 'golang/context.html',
  'golang/gc.html', 'golang/escape.html', 'golang/gmp.html', 'golang/goroutine.html',
  'golang/memory-alloc.html', 'golang/memory-model.html', 'golang/select.html',
  'golang/timer.html',
  'cs/barrier.html', 'cs/atomic.html', 'cs/io.html', 'cs/cache.html',
  'cs/cpu.html', 'cs/memory.html', 'cs/number.html',
];

// All module index pages
const MODULE_INDEX_PAGES = [
  'index.html', 'golang/index.html', 'cs/index.html',
  'algo/index.html', 'db/index.html', 'kafka/index.html',
  'redis/index.html', 'linux/index.html', 'network/index.html',
  'distributed/index.html', 'ai/index.html', 'system-design/index.html',
  'cloud-native/index.html', 'observability/index.html',
  'security/index.html', 'testing/index.html',
];

function read(rel) {
  return readFileSync(join(ROOT, rel), 'utf8');
}

function exists(rel) {
  return existsSync(join(ROOT, rel));
}

// Resolve a relative href from a source file to a blog-root-relative path
function resolveHref(srcRel, href) {
  if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('//')) return null;
  const srcDir = srcRel.includes('/') ? srcRel.replace(/\/[^/]+$/, '') : '';
  const parts = (srcDir ? srcDir + '/' + href : href).split('/');
  const resolved = [];
  for (const p of parts) {
    if (p === '..') resolved.pop();
    else if (p !== '.') resolved.push(p);
  }
  return resolved.join('/');
}

// Extract all href="*.html" from content (excluding external links and fragments)
function extractInternalHrefs(content) {
  const hrefs = [];
  const re = /href="([^"#][^"]*)"/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const h = m[1];
    if (h.startsWith('http') || h.startsWith('//')) continue;
    if (h.endsWith('.html') || h.includes('.html?')) hrefs.push(h.split('?')[0]);
  }
  return hrefs;
}

describe('Animation pages — required DOM structure', () => {
  // Note: older golang pages (gc.html, gmp.html) use id="diagramSvg"; newer pages use id="svg"
  const REQUIRED_IDS = ['scenarios', 'stepNum', 'stepTitle', 'stepDesc', 'flowNav', 'codeBody', 'btnNext', 'btnPrev', 'btnReset'];

  for (const page of ANIMATION_PAGES) {
    it(`${page} has all required element IDs`, () => {
      const content = read(page);
      for (const id of REQUIRED_IDS) {
        expect(content, `missing id="${id}" in ${page}`).toContain(`id="${id}"`);
      }
      // SVG element may be id="svg" or id="diagramSvg"
      const hasSvg = content.includes('id="svg"') || content.includes('id="diagramSvg"');
      expect(hasSvg, `missing svg diagram element in ${page}`).toBe(true);
    });
  }
});

describe('Animation pages — CSS layout fix', () => {
  for (const page of ANIMATION_PAGES) {
    it(`${page} does NOT have html,body{height:100%} (flex collapse bug)`, () => {
      const content = read(page);
      expect(content).not.toMatch(/html\s*,\s*body\s*\{[^}]*height\s*:\s*100%/);
    });

    it(`${page} uses calc(100vh - var(--snav-h) for .main-area height`, () => {
      const content = read(page);
      expect(content).toContain('calc(100vh - var(--snav-h');
    });
  }
});

describe('Animation pages — NavTracker.track() call', () => {
  for (const page of ANIMATION_PAGES) {
    it(`${page} calls NavTracker.track(`, () => {
      const content = read(page);
      expect(content).toContain('NavTracker.track(');
    });
  }
});

describe('Animation pages — nav.js script tag', () => {
  for (const page of ANIMATION_PAGES) {
    it(`${page} includes nav.js`, () => {
      const content = read(page);
      expect(content).toMatch(/src=["'][.\/]*nav\.js["']/);
    });
  }
});

describe('Module index pages — exist', () => {
  for (const page of MODULE_INDEX_PAGES) {
    it(`${page} exists`, () => {
      expect(exists(page)).toBe(true);
    });
  }
});

describe('Internal link integrity', () => {
  const CHECK_PAGES = [...ANIMATION_PAGES, ...MODULE_INDEX_PAGES, 'graph.html'];

  for (const page of CHECK_PAGES) {
    it(`${page} — all internal .html hrefs resolve to existing files`, () => {
      const content = read(page);
      const hrefs = extractInternalHrefs(content);
      const broken = [];
      for (const href of hrefs) {
        const resolved = resolveHref(page, href);
        if (resolved && !exists(resolved)) {
          broken.push(`${href} → ${resolved}`);
        }
      }
      expect(broken, `Broken links in ${page}:\n${broken.join('\n')}`).toHaveLength(0);
    });
  }
});
