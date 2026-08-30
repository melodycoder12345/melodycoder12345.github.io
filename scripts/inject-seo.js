#!/usr/bin/env node
/**
 * inject-seo.js — 批量为所有 HTML 页面注入 SEO meta 标签，并生成 sitemap.xml
 *
 * 用法: node scripts/inject-seo.js
 *
 * 功能:
 * - 为每个 HTML 文件注入 meta description、canonical、Open Graph、Twitter Card
 * - 生成 sitemap.xml（含所有页面）
 * - 幂等：已注入的页面跳过（检测 og:title）
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadKnowledge } from './knowledge-lib.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BASE_URL = 'https://melodycoder12345.github.io';
const SITE_NAME = '码海拾贝';
const TODAY = new Date().toISOString().slice(0, 10);

// ── SEO 数据直接来自统一知识源 ──────────────────────────────────────────────
const knowledge = loadKnowledge();
const MODULES = Object.keys(knowledge.modules);
const NODES = [
  {href:'index.html', label:'码海拾贝', desc:'系统设计、算法、Golang、数据库、Redis、Kafka、Linux、分布式等后端工程核心知识的可视化星图与深度笔记。'},
  ...knowledge.nodes.map(({ href, label, desc }) => ({ href, label, desc })),
];
const nodeMap = new Map(NODES.map(n => [n.href, n]));

// ── 生成单个页面的 SEO meta block ─────────────────────────────────────────────
function buildSeoBlock(node) {
  const url = `${BASE_URL}/${node.href}`;
  const title = node.href === 'index.html'
    ? SITE_NAME
    : `${node.label} — ${SITE_NAME}`;
  const desc = node.desc;

  return [
    `<meta name="description" content="${esc(desc)}">`,
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(desc)}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:type" content="article">`,
    `<meta property="og:site_name" content="${SITE_NAME}">`,
    `<meta name="twitter:card" content="summary">`,
    `<meta name="twitter:title" content="${esc(title)}">`,
    `<meta name="twitter:description" content="${esc(desc)}">`,
  ].join('\n');
}

function esc(str) {
  return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── 注入到 HTML 文件 ──────────────────────────────────────────────────────────
function injectSeo(filePath, href) {
  const node = nodeMap.get(href);
  if (!node) {
    console.warn(`  [skip] no node data for: ${href}`);
    return false;
  }

  let html = fs.readFileSync(filePath, 'utf8');

  // 幂等检查：已有 og:title 则跳过
  if (html.includes('og:title')) {
    console.log(`  [skip] already has og:title: ${href}`);
    return false;
  }

  const seoBlock = buildSeoBlock(node);

  // 插入位置：viewport meta 之后
  const viewportRe = /(<meta[^>]+name=["']viewport["'][^>]*>)/i;
  if (viewportRe.test(html)) {
    html = html.replace(viewportRe, `$1\n${seoBlock}`);
  } else {
    // fallback：插在 charset meta 之后
    const charsetRe = /(<meta[^>]+charset[^>]*>)/i;
    if (charsetRe.test(html)) {
      html = html.replace(charsetRe, `$1\n${seoBlock}`);
    } else {
      console.warn(`  [warn] no suitable insertion point in: ${href}`);
      return false;
    }
  }

  fs.writeFileSync(filePath, html, 'utf8');
  return true;
}

// ── 主流程 ───────────────────────────────────────────────────────────────────
let processed = 0;
let skipped = 0;
const sitemapUrls = [];

function processFile(filePath, href) {
  const ok = injectSeo(filePath, href);
  if (ok) {
    processed++;
    console.log(`  [ok] ${href}`);
  } else {
    skipped++;
  }
  sitemapUrls.push(href);
}

// 1. 处理 index.html（根目录）
const indexPath = path.join(ROOT, 'index.html');
if (fs.existsSync(indexPath)) processFile(indexPath, 'index.html');

// 2. 处理各模块目录
for (const mod of MODULES) {
  const modDir = path.join(ROOT, mod);
  if (!fs.existsSync(modDir)) continue;

  const files = fs.readdirSync(modDir).filter(f => f.endsWith('.html'));
  for (const file of files) {
    const href = `${mod}/${file}`;
    processFile(path.join(modDir, file), href);
  }
}

// 3. 处理根目录其他 HTML 文件（graph.html, architecture.html 等）
const rootHtmlFiles = fs.readdirSync(ROOT).filter(
  f => f.endsWith('.html') && f !== 'index.html'
);
for (const file of rootHtmlFiles) {
  const href = file;
  // 这些页面没有 graph node，用通用数据
  const filePath = path.join(ROOT, file);
  let html = fs.readFileSync(filePath, 'utf8');
  if (!html.includes('og:title')) {
    // 尝试从 <title> 提取标题
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    const label = titleMatch ? titleMatch[1] : SITE_NAME;
    const url = `${BASE_URL}/${href}`;
    const desc = `${label} — ${SITE_NAME}`;
    const block = [
      `<meta name="description" content="${esc(desc)}">`,
      `<link rel="canonical" href="${url}">`,
      `<meta property="og:title" content="${esc(label)}">`,
      `<meta property="og:description" content="${esc(desc)}">`,
      `<meta property="og:url" content="${url}">`,
      `<meta property="og:type" content="website">`,
      `<meta property="og:site_name" content="${SITE_NAME}">`,
      `<meta name="twitter:card" content="summary">`,
      `<meta name="twitter:title" content="${esc(label)}">`,
      `<meta name="twitter:description" content="${esc(desc)}">`,
    ].join('\n');

    const viewportRe = /(<meta[^>]+name=["']viewport["'][^>]*>)/i;
    if (viewportRe.test(html)) {
      html = html.replace(viewportRe, `$1\n${block}`);
      fs.writeFileSync(filePath, html, 'utf8');
      processed++;
      console.log(`  [ok] ${href}`);
    }
  } else {
    skipped++;
  }
  sitemapUrls.push(href);
}

// ── 生成 sitemap.xml ─────────────────────────────────────────────────────────
const sitemapPath = path.join(ROOT, 'sitemap.xml');
const urlEntries = sitemapUrls
  .map(href => {
    const priority = href === 'index.html' ? '1.0'
      : href.endsWith('/index.html') ? '0.8'
      : '0.6';
    const changefreq = href === 'index.html' ? 'weekly' : 'monthly';
    return `  <url>
    <loc>${BASE_URL}/${href}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  })
  .join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;

fs.writeFileSync(sitemapPath, sitemap, 'utf8');
console.log(`\n[sitemap] written: sitemap.xml (${sitemapUrls.length} URLs)`);

// ── 汇总 ─────────────────────────────────────────────────────────────────────
console.log(`\n✓ Done — processed: ${processed}, skipped: ${skipped}`);
