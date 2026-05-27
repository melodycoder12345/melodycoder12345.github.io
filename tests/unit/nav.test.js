// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const NAV_SRC = readFileSync(resolve(__dirname, '../../nav.js'), 'utf8');

// Execute nav.js in current jsdom window, simulating a given path
function loadNav(pathname = '/golang/channel.html') {
  // Reset nav state between tests
  document.getElementById('__snav')?.remove();
  document.getElementById('__snavPad')?.remove();
  document.getElementById('__siteMobileCss')?.remove();
  delete window.NavTracker;
  localStorage.clear();

  // Set location
  Object.defineProperty(window, 'location', {
    value: { pathname, href: `http://localhost${pathname}`, search: '', origin: 'http://localhost' },
    writable: true,
    configurable: true,
  });

  // Execute nav.js IIFE
  const fn = new Function('window', 'document', 'localStorage', NAV_SRC);
  fn(window, document, localStorage);
}

describe('nav.js — DOM injection', () => {
  beforeEach(() => loadNav('/golang/channel.html'));

  it('injects #__snav into document.body', () => {
    expect(document.getElementById('__snav')).not.toBeNull();
  });

  it('injects #__snavPad style into document.head', () => {
    expect(document.getElementById('__snavPad')).not.toBeNull();
  });

  it('#__snavPad sets padding-top on body', () => {
    const style = document.getElementById('__snavPad');
    expect(style.textContent).toMatch(/padding-top/);
  });

  it('injects __siteMobileCss link into document.head', () => {
    expect(document.getElementById('__siteMobileCss')).not.toBeNull();
  });

  it('does not inject #__snav twice if called again', () => {
    // Re-running nav.js on same page should be a no-op
    const fn = new Function('window', 'document', 'localStorage', NAV_SRC);
    fn(window, document, localStorage);
    const navbars = document.querySelectorAll('#__snav');
    expect(navbars.length).toBe(1);
  });
});

describe('NavTracker.track()', () => {
  beforeEach(() => {
    loadNav('/golang/channel.html');
    localStorage.clear();
  });

  it('is available on window after nav.js loads', () => {
    expect(typeof window.NavTracker).toBe('object');
    expect(typeof window.NavTracker.track).toBe('function');
  });

  it('stores a page entry in localStorage', () => {
    window.NavTracker.track('Channel', 'golang/channel.html', '📡', 'Golang');
    const items = JSON.parse(localStorage.getItem('recentPages_v2'));
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe('Channel');
    expect(items[0].icon).toBe('📡');
    expect(items[0].cat).toBe('Golang');
  });

  it('inserts new entry at the front (most recent first)', () => {
    window.NavTracker.track('Channel', 'golang/channel.html', '📡', 'Golang');
    window.NavTracker.track('GMP', 'golang/gmp.html', '⚙️', 'Golang');
    const items = JSON.parse(localStorage.getItem('recentPages_v2'));
    expect(items[0].name).toBe('GMP');
    expect(items[1].name).toBe('Channel');
  });

  it('deduplicates by href — same href replaces existing entry, moves to front', () => {
    window.NavTracker.track('Channel', 'golang/channel.html', '📡', 'Golang');
    window.NavTracker.track('GMP', 'golang/gmp.html', '⚙️', 'Golang');
    window.NavTracker.track('Channel', 'golang/channel.html', '📡', 'Golang');
    const items = JSON.parse(localStorage.getItem('recentPages_v2'));
    expect(items).toHaveLength(2);
    expect(items[0].name).toBe('Channel');
  });

  it('caps storage at 20 entries', () => {
    for (let i = 0; i < 25; i++) {
      window.NavTracker.track(`Page ${i}`, `golang/page-${i}.html`, '📄', 'Golang');
    }
    const items = JSON.parse(localStorage.getItem('recentPages_v2'));
    expect(items).toHaveLength(20);
  });

  it('ignores entries with empty name', () => {
    window.NavTracker.track('', 'golang/channel.html', '📡', 'Golang');
    const items = JSON.parse(localStorage.getItem('recentPages_v2') || '[]');
    expect(items).toHaveLength(0);
  });

  it('ignores entries with empty href', () => {
    window.NavTracker.track('Channel', '', '📡', 'Golang');
    const items = JSON.parse(localStorage.getItem('recentPages_v2') || '[]');
    expect(items).toHaveLength(0);
  });

  it('uses default icon 📄 when icon is omitted', () => {
    window.NavTracker.track('Channel', 'golang/channel.html', undefined, 'Golang');
    const items = JSON.parse(localStorage.getItem('recentPages_v2'));
    expect(items[0].icon).toBe('📄');
  });
});
