import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

function loadProfiles() {
  const window = {};
  new Function('window', readFileSync(join(ROOT, 'knowledge-data.js'), 'utf8'))(window);
  return window;
}

describe('page profiles', () => {
  it('covers every graph page with a valid identity and schema enum values', () => {
    const window = loadProfiles();
    const pages = window.GRAPH_NODES.filter(node => node.type === 'page');
    expect(window.PAGE_PROFILES).toHaveLength(pages.length);
    expect(new Set(window.PAGE_PROFILES.map(profile => profile.id)).size).toBe(pages.length);

    for (const profile of window.PAGE_PROFILES) {
      const node = pages.find(item => item.id === profile.id);
      expect(node, `unknown profile id ${profile.id}`).toBeTruthy();
      expect(profile.href).toBe(node.href);
      expect(['algorithm', 'data-structure', 'mechanism', 'protocol', 'system', 'practice']).toContain(profile.kind);
      expect(['beginner', 'intermediate', 'advanced']).toContain(profile.level);
      expect(['none', 'stepper', 'simulator', 'playground']).toContain(profile.interaction);
      profile.presentations.forEach(value => expect(['article', 'diagram', 'animation', 'code', 'comparison', 'lab']).toContain(value));
      expect(profile.learning.objective.trim()).not.toBe('');
    }
  });

  it('provides curated profiles for representative pages', () => {
    const window = loadProfiles();
    expect(window.getPageProfile('db/buffer-pool.html')).toMatchObject({ id: 'buffer', interaction: 'stepper' });
    expect(window.getPageProfile('ai-attention')).toMatchObject({ href: 'ai/transformer-attention.html' });
    expect(window.getPageProfile('./golang/channel.html?mode=learn')).toMatchObject({ id: 'go-channel', interaction: 'simulator' });
  });

  it('provides beginner orientation for every network knowledge page', () => {
    const window = loadProfiles();
    const networkPages = window.PAGE_PROFILES.filter(profile => profile.module === 'network');
    expect(networkPages).toHaveLength(15);
    for (const profile of networkPages) {
      expect(profile.learning.orientation, `${profile.id} should explain its background`).toMatchObject({
        background: expect.any(String),
        problem: expect.any(String),
        position: expect.any(String),
        questions: expect.any(Array)
      });
      expect(profile.learning.orientation.questions.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('returns null for unknown or invalid lookups', () => {
    const window = loadProfiles();
    expect(window.getPageProfile('missing')).toBeNull();
    expect(window.getPageProfile()).toBeNull();
  });
});
