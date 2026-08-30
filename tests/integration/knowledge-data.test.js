import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { generateKnowledgeData } from '../../scripts/knowledge-generator.js';

const ROOT = resolve(import.meta.dirname, '../..');

function sourceData() {
  const modules = JSON.parse(readFileSync(join(ROOT, 'knowledge/modules.json'), 'utf8'));
  const nodes = readdirSync(join(ROOT, 'knowledge/nodes'))
    .filter(file => file.endsWith('.json'))
    .sort()
    .flatMap(file => JSON.parse(readFileSync(join(ROOT, 'knowledge/nodes', file), 'utf8')));
  const relations = JSON.parse(readFileSync(join(ROOT, 'knowledge/relations.json'), 'utf8'));
  const relationCandidates = JSON.parse(readFileSync(join(ROOT, 'knowledge/relation-candidates.json'), 'utf8'));
  return { modules, nodes, relations, relationCandidates };
}

function generatedData() {
  const window = {};
  new Function('window', readFileSync(join(ROOT, 'knowledge-data.js'), 'utf8'))(window);
  return window;
}

describe('generated knowledge data', () => {
  it('is byte-for-byte up to date with the canonical sources', () => {
    expect(readFileSync(join(ROOT, 'knowledge-data.js'), 'utf8')).toBe(generateKnowledgeData());
  });

  it('matches the canonical structured sources', () => {
    const source = sourceData();
    const generated = generatedData();
    expect(generated.GRAPH_MODULES).toEqual(source.modules);
    expect(generated.GRAPH_NODES).toEqual(source.nodes);
    expect(generated.KNOWLEDGE_RELATIONS).toEqual(source.relations);
    expect(generated.GRAPH_EDGES).toEqual(source.relations.map(({ source, target }) => [source, target]));
  });

  it('derives one page profile for every page node', () => {
    const generated = generatedData();
    const pages = generated.GRAPH_NODES.filter(node => node.type === 'page');
    expect(generated.PAGE_PROFILES).toHaveLength(pages.length);
    for (const node of pages) {
      expect(generated.getPageProfile(node.id)).toMatchObject({ id: node.id, href: node.href });
    }
  });

  it('keeps classification and unreviewed candidates out of the formal graph', () => {
    const source = sourceData();
    const generated = generatedData();
    const nodesById = new Map(source.nodes.map(node => [node.id, node]));
    const candidateIds = new Set(source.relationCandidates.map(relation => relation.id));
    expect(generated.KNOWLEDGE_RELATIONS.every(relation => relation.status === 'reviewed')).toBe(true);
    for (const relation of generated.KNOWLEDGE_RELATIONS) {
      expect(candidateIds.has(relation.id)).toBe(false);
      expect(nodesById.get(relation.source).type).toBe('page');
      expect(nodesById.get(relation.target).type).toBe('page');
    }
  });
});
