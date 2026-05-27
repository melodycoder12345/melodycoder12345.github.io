import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');

const ANIMATION_PAGES = [
  'golang/channel.html', 'golang/concurrent-patterns.html', 'golang/context.html',
  'golang/gc.html', 'golang/escape.html', 'golang/gmp.html', 'golang/goroutine.html',
  'golang/memory-alloc.html', 'golang/memory-model.html', 'golang/select.html',
  'golang/timer.html',
  'cs/barrier.html', 'cs/atomic.html', 'cs/io.html', 'cs/cache.html',
  'cs/cpu.html', 'cs/memory.html', 'cs/number.html',
];

// Extract SCENARIOS array from HTML by finding and evaluating the script block.
// Returns null if extraction fails.
function extractScenarios(html) {
  const scriptRe = /<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptRe.exec(html)) !== null) {
    const src = match[1];
    if (!src.includes('SCENARIOS')) continue;

    try {
      // Provide a comprehensive DOM stub so that initialization code (initScenarios,
      // render, direct addEventListener calls) can run without throwing.
      // Pages differ in structure: some wrap init in DOMContentLoaded, others call it inline.
      const fn = new Function(`
        const _el = () => ({
          innerHTML:'', textContent:'', disabled:false, className:'', style:{opacity:''},
          classList:{toggle(){},remove(){},add(){},contains(){return false;}},
          addEventListener(){}, appendChild(){}, closest(){ return this; },
          querySelectorAll(){ return []; }, querySelector(){ return null; },
          scrollIntoView(){},
        });
        const document = {
          getElementById: _el,
          createElement: _el,
          querySelectorAll: ()=>[],
          querySelector: _el,
          addEventListener: ()=>{},
          body: { classList:{ add(){} }, querySelectorAll: ()=>[] },
        };
        const window = { location:{ pathname:'/' }, addEventListener(){} };
        const NavTracker = { track(){} };
        ${src}
        return typeof SCENARIOS !== 'undefined' ? SCENARIOS : null;
      `);
      const result = fn();
      if (Array.isArray(result)) return result;
    } catch (e) {
      // Try next script block
    }
  }
  return null;
}

describe('SCENARIOS data structure integrity', () => {
  for (const page of ANIMATION_PAGES) {
    describe(page, () => {
      let scenarios;

      it('contains a SCENARIOS array', () => {
        const html = readFileSync(join(ROOT, page), 'utf8');
        scenarios = extractScenarios(html);
        expect(scenarios, `Could not extract SCENARIOS from ${page}`).not.toBeNull();
        expect(Array.isArray(scenarios)).toBe(true);
        expect(scenarios.length).toBeGreaterThanOrEqual(1);
      });

      it('each scenario has required fields', () => {
        const html = readFileSync(join(ROOT, page), 'utf8');
        scenarios = extractScenarios(html);
        if (!scenarios) return;

        for (const [i, sc] of scenarios.entries()) {
          // Older pages (gc.html, gmp.html) use `name`, newer pages use `label`
          const displayName = sc.label ?? sc.name;
          expect(typeof displayName, `scenarios[${i}] missing label/name in ${page}`).toBe('string');
          expect(displayName.trim().length, `scenarios[${i}] label/name empty in ${page}`).toBeGreaterThan(0);
          expect(Array.isArray(sc.steps), `scenarios[${i}].steps not array in ${page}`).toBe(true);
          expect(sc.steps.length, `scenarios[${i}].steps empty in ${page}`).toBeGreaterThan(0);
          expect(typeof sc.render, `scenarios[${i}].render not function in ${page}`).toBe('function');
        }
      });

      it('each step has title and desc', () => {
        const html = readFileSync(join(ROOT, page), 'utf8');
        scenarios = extractScenarios(html);
        if (!scenarios) return;

        for (const [i, sc] of scenarios.entries()) {
          for (const [j, step] of sc.steps.entries()) {
            expect(typeof step.title, `scenarios[${i}].steps[${j}].title in ${page}`).toBe('string');
            expect(typeof step.desc, `scenarios[${i}].steps[${j}].desc in ${page}`).toBe('string');
            expect(step.title.trim().length, `scenarios[${i}].steps[${j}].title empty`).toBeGreaterThan(0);
          }
        }
      });

      it('hl array length matches steps length', () => {
        const html = readFileSync(join(ROOT, page), 'utf8');
        scenarios = extractScenarios(html);
        if (!scenarios) return;

        for (const [i, sc] of scenarios.entries()) {
          if (!sc.hl) continue;
          expect(sc.hl.length, `scenarios[${i}].hl.length !== steps.length in ${page}`)
            .toBe(sc.steps.length);
        }
      });

      it('code array is non-empty', () => {
        const html = readFileSync(join(ROOT, page), 'utf8');
        scenarios = extractScenarios(html);
        if (!scenarios) return;

        for (const [i, sc] of scenarios.entries()) {
          if (!sc.code) continue;
          expect(sc.code.length, `scenarios[${i}].code empty in ${page}`).toBeGreaterThan(0);
        }
      });
    });
  }
});
