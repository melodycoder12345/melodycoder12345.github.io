import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');

function loadGraphData() {
  const dataSrc = readFileSync(join(ROOT, 'knowledge-data.js'), 'utf8');
  const win = {};
  const fn = new Function('window', dataSrc);
  fn(win);
  return {
    nodes: win.GRAPH_NODES ?? null,
    edges: win.GRAPH_EDGES ?? null,
    relations: win.KNOWLEDGE_RELATIONS ?? null,
    types: win.KNOWLEDGE_RELATION_TYPES ?? null,
  };
}

function loadKnowledgeRelations() {
  return loadGraphData();
}

describe('graph.html — NODES integrity', () => {
  let nodes, edges;

  it('can extract NODES and EDGES arrays', () => {
    ({ nodes, edges } = loadGraphData());
    expect(nodes, 'NODES not found in graph.html').not.toBeNull();
    expect(edges, 'EDGES not found in graph.html').not.toBeNull();
    expect(nodes.length).toBeGreaterThan(0);
    expect(edges.length).toBeGreaterThan(0);
  });

  it('every node has id, label, module, type', () => {
    ({ nodes } = loadGraphData());
    if (!nodes) return;
    for (const n of nodes) {
      expect(typeof n.id, `node missing id: ${JSON.stringify(n)}`).toBe('string');
      expect(n.id.trim().length, `node id empty`).toBeGreaterThan(0);
      expect(typeof n.label, `node ${n.id} missing label`).toBe('string');
      expect(typeof n.module, `node ${n.id} missing module`).toBe('string');
      expect(typeof n.type, `node ${n.id} missing type`).toBe('string');
    }
  });

  it('no duplicate node IDs', () => {
    ({ nodes } = loadGraphData());
    if (!nodes) return;
    const ids = nodes.map(n => n.id);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(dupes, `Duplicate node IDs: ${dupes.join(', ')}`).toHaveLength(0);
  });

  it('page-type nodes have href field', () => {
    ({ nodes } = loadGraphData());
    if (!nodes) return;
    const pageNodes = nodes.filter(n => n.type === 'page');
    for (const n of pageNodes) {
      expect(n.href, `page node ${n.id} missing href`).toBeTruthy();
    }
  });

  it('node hrefs point to existing files', () => {
    ({ nodes } = loadGraphData());
    if (!nodes) return;
    const broken = [];
    for (const n of nodes) {
      if (!n.href) continue;
      if (n.href.startsWith('http') || n.href.startsWith('//')) continue;
      const filePath = join(ROOT, n.href.split('?')[0]);
      if (!existsSync(filePath)) {
        broken.push(`node ${n.id}: href="${n.href}"`);
      }
    }
    expect(broken, `Broken node hrefs:\n${broken.join('\n')}`).toHaveLength(0);
  });
});

describe('graph.html — EDGES integrity', () => {
  it('all edge endpoints exist as node IDs', () => {
    const { nodes, edges } = loadGraphData();
    if (!nodes || !edges) return;
    const nodeIds = new Set(nodes.map(n => n.id));
    const dangling = [];
    for (const [src, dst] of edges) {
      if (!nodeIds.has(src)) dangling.push(`edge [${src}, ${dst}]: unknown src "${src}"`);
      if (!nodeIds.has(dst)) dangling.push(`edge [${src}, ${dst}]: unknown dst "${dst}"`);
    }
    expect(dangling, `Dangling edges:\n${dangling.join('\n')}`).toHaveLength(0);
  });

  it('no self-loop edges', () => {
    const { edges } = loadGraphData();
    if (!edges) return;
    const selfLoops = edges.filter(([src, dst]) => src === dst);
    expect(selfLoops, `Self-loop edges: ${selfLoops.map(e => e[0]).join(', ')}`).toHaveLength(0);
  });
});

describe('semantic knowledge relations', () => {
  it('classifies every valid unique edge into one of seven relation types', () => {
    const { relations, types } = loadKnowledgeRelations();
    expect(Object.keys(types)).toEqual([
      'prerequisite', 'mechanism', 'causal', 'composition',
      'application', 'contrast', 'analogy'
    ]);
    expect(relations.length).toBeGreaterThan(0);
    for (const relation of relations) {
      expect(types[relation.type], `unknown relation type: ${relation.type}`).toBeTruthy();
      expect(relation.summary.trim().length, `missing summary: ${relation.id}`).toBeGreaterThan(0);
    }
  });

  it('has no dangling or duplicate semantic relations', () => {
    const { relations, nodes } = loadKnowledgeRelations();
    const ids = new Set(nodes.map(node => node.id));
    const relationIds = relations.map(relation => relation.id);
    expect(new Set(relationIds).size).toBe(relationIds.length);
    for (const relation of relations) {
      expect(ids.has(relation.source), `unknown source: ${relation.source}`).toBe(true);
      expect(ids.has(relation.target), `unknown target: ${relation.target}`).toBe(true);
    }
  });

  it('reviewed analogies state their boundary', () => {
    const { relations } = loadKnowledgeRelations();
    const reviewedAnalogies = relations.filter(relation => relation.type === 'analogy' && relation.status === 'reviewed');
    expect(reviewedAnalogies.length).toBeGreaterThan(0);
    for (const relation of reviewedAnalogies) {
      expect(relation.details.boundary, `missing analogy boundary: ${relation.id}`).toBeTruthy();
    }
  });
});
