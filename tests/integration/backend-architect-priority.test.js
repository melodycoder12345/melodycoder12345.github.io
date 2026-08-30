import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, test } from 'vitest';

const root = process.cwd();
const grades = ['core', 'engineering', 'merge', 'retire'];

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}

describe('backend and architect content priority audit', () => {
  const audit = readJson('knowledge/audits/backend-architect-priority.json');
  const pageNodes = fs.readdirSync(path.join(root, 'knowledge/nodes'))
    .filter((file) => file.endsWith('.json'))
    .flatMap((file) => readJson(`knowledge/nodes/${file}`))
    .filter((node) => node.type === 'page');
  const pageIds = new Set(pageNodes.map((node) => node.id));
  const classified = Object.values(audit.modules)
    .flatMap((module) => grades.flatMap((grade) => module[grade]));

  test('classifies every page exactly once', () => {
    expect(classified).toHaveLength(pageNodes.length);
    expect(new Set(classified).size).toBe(classified.length);
    expect(new Set(classified)).toEqual(pageIds);
  });

  test('keeps summary counts synchronized with the classification', () => {
    const counts = Object.fromEntries(grades.map((grade) => [
      grade,
      Object.values(audit.modules).reduce((sum, module) => sum + module[grade].length, 0)
    ]));
    expect({ pages: classified.length, ...counts }).toEqual(audit.summary);
  });

  test('gives every merge candidate a stable retained target', () => {
    const merged = new Set(Object.values(audit.modules).flatMap((module) => module.merge));
    expect(new Set(Object.keys(audit.mergeTargets))).toEqual(merged);
    for (const target of Object.values(audit.mergeTargets)) {
      expect(pageIds.has(target)).toBe(true);
      const isRetained = Object.values(audit.modules).some((module) =>
        module.core.includes(target) || module.engineering.includes(target));
      expect(isRetained).toBe(true);
    }
  });
});
