import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

export const ROOT = resolve(import.meta.dirname, '..');
export const KNOWLEDGE_DIR = join(ROOT, 'knowledge');

export const RELATION_TYPES = Object.freeze({
  prerequisite: { label: '前置依赖', directed: true, dash: [] },
  mechanism: { label: '实现机制', directed: true, dash: [] },
  causal: { label: '因果演进', directed: true, dash: [8, 5] },
  composition: { label: '协作组合', directed: false, dash: [3, 4] },
  application: { label: '场景应用', directed: true, dash: [10, 5] },
  contrast: { label: '对比辨析', directed: false, dash: [2, 5] },
  analogy: { label: '跨层类比', directed: false, dash: [12, 4, 2, 4] },
});

export const NODE_ENUMS = Object.freeze({
  type: ['module', 'page'],
  kind: ['algorithm', 'data-structure', 'mechanism', 'protocol', 'system', 'practice'],
  level: ['beginner', 'intermediate', 'advanced'],
  presentation: ['article', 'diagram', 'animation', 'code', 'comparison', 'lab'],
  interaction: ['none', 'stepper', 'simulator', 'playground'],
});

export function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

export function loadKnowledge() {
  const modules = readJson(join(KNOWLEDGE_DIR, 'modules.json'));
  const nodeFiles = readdirSync(join(KNOWLEDGE_DIR, 'nodes'))
    .filter(file => file.endsWith('.json'))
    .sort();
  const nodes = nodeFiles.flatMap(file => readJson(join(KNOWLEDGE_DIR, 'nodes', file)));
  const relations = readJson(join(KNOWLEDGE_DIR, 'relations.json'));
  const relationCandidates = readJson(join(KNOWLEDGE_DIR, 'relation-candidates.json'));
  return { modules, nodes, relations, relationCandidates, relationTypes: RELATION_TYPES };
}

export function detailHtmlFiles() {
  const ignored = new Set(['node_modules', 'tests', 'docs', 'knowledge', 'scripts', 'test-results']);
  const files = [];
  for (const entry of readdirSync(ROOT, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith('.') || ignored.has(entry.name)) continue;
    for (const file of readdirSync(join(ROOT, entry.name))) {
      if (file.endsWith('.html') && file !== 'index.html') files.push(`${entry.name}/${file}`);
    }
  }
  return files.sort();
}

export function displayPath(file) {
  return relative(ROOT, file).split(sep).join('/');
}

export { existsSync, join };
