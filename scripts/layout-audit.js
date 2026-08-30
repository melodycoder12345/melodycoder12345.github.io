import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';
import { ROOT, detailHtmlFiles, existsSync, join, loadKnowledge } from './knowledge-lib.js';

const INTERACTIVE_IDS = [
  'btnNext', 'btnPrev', 'btnPlay', 'btnReset', 'stepList', 'scenarios',
  'flowNav', 'codeBody', 'stage', 'svg', 'diagramSvg',
];
const FALLBACK_TITLE_SELECTOR = [
  '.page-title', '.nav-title', '.hero-title', '.title-bar .title', 'header .title',
  '.sp-head .sp-title', '.lp-head .lp-title', '.topnav .topnav-title',
].join(', ');
const TOC_SELECTOR = '.side-nav, .toc, #toc, .table-of-contents, [aria-label*="目录"], [data-toc]';
export const READING_NAVIGATION_CONTRACT = Object.freeze({
  minChars: 7000,
  minHeadings: 6,
  frameworkFile: 'page-framework.js',
  navigationId: '__reading-navigation',
  progressId: '__reading-progress',
  backTopId: '__reading-backtop',
  nativeToggleClass: 'pf-native-toc-toggle',
});

function hasClass(document, name) {
  return Boolean(document.querySelector(`.${name}`));
}

function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function credibleFallbackTitle(document) {
  return [...document.querySelectorAll(FALLBACK_TITLE_SELECTOR)].find(element => {
    const text = cleanText(element.textContent);
    return text.length >= 2 && text.length <= 100 && !element.closest('footer');
  }) || null;
}

function readableBodyText(document) {
  const body = document.body?.cloneNode(true);
  if (!body) return '';
  body.querySelectorAll('script, style, template, noscript, nav, footer').forEach(element => element.remove());
  return cleanText(body.textContent);
}

function hasFixedWideLayout(html) {
  const rulePattern = /([^{}]+)\{([^{}]*)\}/g;
  let match;
  while ((match = rulePattern.exec(html))) {
    const selector = match[1];
    const declarations = match[2];
    if (!/(?:^|[\s,.#>])(main|article|content|container|layout|main-area)(?:[\s,.#:[>]|$)/i.test(selector)) continue;
    const width = declarations.match(/(?:^|;)\s*(?:min-)?width\s*:\s*(\d{4,})px/i);
    if (width && Number(width[1]) >= 1280) return true;
  }
  return false;
}

function hasWideGridWithoutBreakpoint(html) {
  const columnDeclarations = [...html.matchAll(/grid-template-columns\s*:\s*([^;{}]+)[;}]/gi)].map(match => match[1].trim());
  const threeColumnGrid = columnDeclarations.some(value => {
    if (/\brepeat\(\s*3\s*,/i.test(value)) return true;
    let normalized = value;
    let previous;
    do {
      previous = normalized;
      normalized = normalized.replace(/[\w-]+\([^()]*\)/g, 'track');
    } while (normalized !== previous);
    return normalized.split(/\s+/).filter(Boolean).length === 3;
  });
  if (!threeColumnGrid) return false;
  const responsiveBlocks = html.split(/(?=@media\s*\([^)]*max-width)/i).slice(1);
  const responsiveEvidence = responsiveBlocks.some(block => (
    /grid-template-columns\s*:\s*(?:1fr|minmax\([^;{}]+\))\s*[;}]/i.test(block) ||
    /flex-direction\s*:\s*column\b/i.test(block) ||
    /(?:\.panel|aside|\.sidebar|\.code-panel)[^{]*\{[^}]*display\s*:\s*none\b/i.test(block) ||
    /(?:\.tabs?|\.panel-switch|\.mobile-nav)[^{]*\{[^}]*display\s*:\s*(?!none)\w+/i.test(block)
  ));
  return !responsiveEvidence;
}

function hasControlBarOverflowRisk(document, html) {
  const bars = [...document.querySelectorAll('.controls, .control-bar, .toolbar, [class*="controls"]')];
  if (!bars.some(bar => bar.querySelectorAll('button, select, input, a').length >= 4)) return false;
  const explicitlyRigid = /(?:\.controls?|\.control-bar|\.toolbar)[^{]*\{[^}]*(?:flex-wrap\s*:\s*nowrap|white-space\s*:\s*nowrap)/i.test(html);
  const hasEscape = /(?:\.controls?|\.control-bar|\.toolbar)[^{]*\{[^}]*(?:overflow-x\s*:\s*(?:auto|scroll)|flex-wrap\s*:\s*wrap)/i.test(html) ||
    /@media\s*\([^)]*max-width[\s\S]*?(?:\.controls?|\.control-bar|\.toolbar)[^{]*\{[^}]*(?:flex-wrap\s*:\s*wrap|overflow-x\s*:\s*(?:auto|scroll))/i.test(html);
  return explicitlyRigid && !hasEscape;
}

function hasUnboundedGraphicRisk(document, html) {
  const largeGraphic = [...document.querySelectorAll('svg, canvas')].some(element => {
    const width = Number.parseFloat(element.getAttribute('width') || '0');
    const styleWidth = Number.parseFloat(element.style.width || '0');
    return width >= 800 || styleWidth >= 800;
  }) || /(?:svg|canvas)[^{]*\{[^}]*(?:min-)?width\s*:\s*(?:[89]\d{2}|\d{4,})px/i.test(html);
  if (!largeGraphic) return false;
  const bounded = /(?:svg|canvas)[^{]*\{[^}]*max-width\s*:\s*100%/i.test(html) ||
    /(?:\.viz|\.diagram|\.canvas|\.stage|\.visualization)[^{]*\{[^}]*overflow-x\s*:\s*(?:auto|scroll)/i.test(html);
  return !bounded;
}

function hasWideContentRisk(document, html) {
  if (!document.querySelector('pre, table')) return false;
  const explicitlyWide = /(?:pre|table)[^{]*\{[^}]*(?:min-)?width\s*:\s*(?:[89]\d{2}|\d{4,})px/i.test(html) ||
    /<table\b[^>]*\bwidth=["']?(?:[89]\d{2}|\d{4,})/i.test(html);
  if (!explicitlyWide) return false;
  const protectedContent = /(?:pre|table|\.table-wrap|\.code-panel|\.code-body)[^{]*\{[^}]*overflow-x\s*:\s*(?:auto|scroll)/i.test(html) ||
    /(?:pre|table)[^{]*\{[^}]*max-width\s*:\s*100%/i.test(html);
  return !protectedContent;
}

function titleStructure(title) {
  if (!title) return 'missing';
  if (title.closest('.hero')) return 'hero';
  if (title.closest('header, nav, .topbar, .top-bar, .header, .title-bar')) return 'title-bar';
  return 'content';
}

export function analyzeHtml(html, profile = null, href = 'fixture.html') {
  const { document } = new JSDOM(html).window;
  const headings = [...document.querySelectorAll('h1')];
  const title = headings[0] || null;
  const fallbackTitle = title ? null : credibleFallbackTitle(document);
  const bodyTextLength = readableBodyText(document).length;
  const sectionHeadingCount = document.querySelectorAll('main h2, article h2, .content h2').length;
  const hasToc = Boolean(document.querySelector(TOC_SELECTOR));
  const fixedWideLayout = hasFixedWideLayout(html);
  const wideGridWithoutBreakpoint = hasWideGridWithoutBreakpoint(html);
  const controlBarOverflowRisk = hasControlBarOverflowRisk(document, html);
  const unboundedGraphicRisk = hasUnboundedGraphicRisk(document, html);
  const wideContentRisk = hasWideContentRisk(document, html);
  const interactiveIds = INTERACTIVE_IDS.filter(id => document.getElementById(id));
  const signals = {
    hero: hasClass(document, 'hero'),
    lab: hasClass(document, 'lab'),
    viz: Boolean(document.querySelector('.viz, .viz-panel, .viz-area, .visualization')),
    code: Boolean(document.querySelector('.code-panel, .code-body, pre code, .editor')),
    fullscreen: /100vh|calc\(\s*100vh/i.test(html) && (
      Boolean(document.querySelector('.main-area, .layout, .app')) ||
      /body\s*\{[^}]*height\s*:\s*100vh[^}]*overflow\s*:\s*hidden/is.test(html)
    ),
    interactive: interactiveIds.length >= 2 || Boolean(document.querySelector('.lab button, .controls button')),
  };
  const loadsGlobalFramework = existsSync(join(ROOT, READING_NAVIGATION_CONTRACT.frameworkFile)) &&
    [...document.querySelectorAll('script[src]')].some(script => /(?:^|\/)(?:nav|page-framework)\.js(?:[?#].*)?$/i.test(script.getAttribute('src') || ''));
  const runtimeTocEligible = loadsGlobalFramework &&
    bodyTextLength >= READING_NAVIGATION_CONTRACT.minChars &&
    sectionHeadingCount >= READING_NAVIGATION_CONTRACT.minHeadings &&
    !signals.fullscreen && !(signals.hero && signals.lab);
  const tocSource = hasToc ? 'native' : (runtimeTocEligible ? 'runtime' : 'none');

  const templates = [];
  if (signals.fullscreen) templates.push('fullscreen');
  if (signals.hero) templates.push('hero');
  if (signals.lab) templates.push('lab');
  if (signals.viz && signals.code) templates.push('viz-code');
  if (!templates.length) templates.push('article');

  const issues = [];
  if (!headings.length && fallbackTitle) {
    issues.push({ level: 'notice', code: 'semantic-title-fallback', message: `使用 ${fallbackTitle.matches('.page-title') ? '.page-title' : '现有标题类'} 识别页级标题，运行时补充 heading 语义` });
  } else if (!headings.length) {
    issues.push({ level: 'warning', code: 'missing-page-title', message: '详情页缺少 h1，也没有可信的页级标题元素' });
  }
  if (headings.length > 1) issues.push({ level: 'warning', code: 'multiple-h1', message: `详情页包含 ${headings.length} 个 h1` });
  if (bodyTextLength >= READING_NAVIGATION_CONTRACT.minChars) {
    issues.push({ level: 'notice', code: 'long-content', message: `正文约 ${bodyTextLength} 字符，建议检查阅读宽度与章节节奏` });
    if (sectionHeadingCount >= READING_NAVIGATION_CONTRACT.minHeadings && tocSource === 'none') {
      issues.push({ level: 'notice', code: 'long-content-without-toc', message: `长正文包含 ${sectionHeadingCount} 个二级标题但没有检测到目录` });
    }
  }
  if (fixedWideLayout) issues.push({ level: 'warning', code: 'fixed-wide-layout', message: '主内容存在至少 1280px 的固定/最小宽度，可能产生横向滚动' });
  if (wideGridWithoutBreakpoint) issues.push({ level: 'notice', code: 'wide-grid-without-breakpoint', message: '检测到三列布局，但未发现断点内降为单列、纵向堆叠或面板切换的明确证据' });
  if (controlBarOverflowRisk) issues.push({ level: 'notice', code: 'control-bar-overflow-risk', message: '多控件控制栏显式禁止换行，且未检测到横向滚动或窄屏换行兜底' });
  if (unboundedGraphicRisk) issues.push({ level: 'notice', code: 'unbounded-graphic-risk', message: '大尺寸 SVG/canvas 未检测到 max-width: 100% 或容器横向滚动兜底' });
  if (wideContentRisk) issues.push({ level: 'notice', code: 'wide-content-overflow-risk', message: '宽代码块或表格未检测到横向滚动或 max-width 兜底' });
  if (!profile) {
    issues.push({ level: 'error', code: 'missing-profile', message: '页面没有对应的结构化画像' });
  } else {
    const presentations = profile.presentations || [];
    if (signals.interactive && profile.interaction === 'none') {
      issues.push({ level: 'notice', code: 'interaction-mismatch', message: 'DOM 存在交互控件，但画像 interaction 为 none' });
    }
    if ((signals.lab || signals.interactive) && presentations.length === 1 && presentations[0] === 'article') {
      issues.push({ level: 'notice', code: 'presentation-mismatch', message: 'DOM 是实验/交互布局，但画像仅标记为 article' });
    }
    if (signals.viz && !presentations.some(value => ['diagram', 'animation', 'lab'].includes(value))) {
      issues.push({ level: 'notice', code: 'visual-mismatch', message: 'DOM 包含可视化区域，但画像未标记 diagram、animation 或 lab' });
    }
    if (signals.code && !presentations.includes('code')) {
      issues.push({ level: 'notice', code: 'code-mismatch', message: 'DOM 包含代码区域，但画像未标记 code' });
    }
  }

  return {
    href,
    profileId: profile?.id || null,
    title: cleanText((title || fallbackTitle)?.textContent),
    h1Count: headings.length,
    titleStructure: title ? titleStructure(title) : (fallbackTitle ? 'semantic-fallback' : 'missing'),
    templates,
    signals: { ...signals, interactiveIds },
    metrics: { bodyTextLength, sectionHeadingCount, hasToc, loadsGlobalFramework, runtimeTocEligible, tocSource, fixedWideLayout, wideGridWithoutBreakpoint, controlBarOverflowRisk, unboundedGraphicRisk, wideContentRisk },
    profile: profile ? { interaction: profile.interaction, presentations: profile.presentations } : null,
    issues,
  };
}

export function auditLayouts() {
  const { nodes } = loadKnowledge();
  const profiles = new Map(nodes.filter(node => node.type === 'page').map(node => [node.href, node]));
  for (const node of nodes.filter(node => node.type === 'page')) {
    for (const href of node.embeddedDemos || []) profiles.set(href, node);
  }
  return detailHtmlFiles()
    .filter(href => !href.endsWith('/topic.html'))
    .map(href => analyzeHtml(readFileSync(join(ROOT, href), 'utf8'), profiles.get(href), href));
}

export function summarize(results) {
  const counts = { pages: results.length, errors: 0, warnings: 0, notices: 0 };
  const templates = {};
  const titleStructures = {};
  for (const result of results) {
    for (const template of result.templates) templates[template] = (templates[template] || 0) + 1;
    titleStructures[result.titleStructure] = (titleStructures[result.titleStructure] || 0) + 1;
    for (const issue of result.issues) counts[`${issue.level}s`] += 1;
  }
  return { counts, templates, titleStructures };
}

function printHuman(results) {
  const summary = summarize(results);
  console.log('布局审计');
  console.log(`页面 ${summary.counts.pages} · 错误 ${summary.counts.errors} · 警告 ${summary.counts.warnings} · 提示 ${summary.counts.notices}`);
  console.log(`模板 ${Object.entries(summary.templates).map(([key, value]) => `${key}=${value}`).join(' ')}`);
  console.log(`标题 ${Object.entries(summary.titleStructures).map(([key, value]) => `${key}=${value}`).join(' ')}`);
  for (const result of results.filter(item => item.issues.length)) {
    console.log(`\n${result.href} [${result.templates.join(', ')}; title=${result.titleStructure}]`);
    for (const issue of result.issues) console.log(`  ${issue.level.toUpperCase()} ${issue.code}: ${issue.message}`);
  }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const results = auditLayouts();
  if (process.argv.includes('--json')) console.log(JSON.stringify({ summary: summarize(results), pages: results }, null, 2));
  else printHuman(results);
  if (process.argv.includes('--strict') && results.some(result => result.issues.some(issue => issue.level === 'error'))) process.exitCode = 1;
}
