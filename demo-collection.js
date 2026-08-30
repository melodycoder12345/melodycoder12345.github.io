(function () {
  'use strict';

  const config = window.DEMO_COLLECTION;
  if (!config) return;

  const tabs = document.getElementById('demoTabs');
  const frame = document.getElementById('demoFrame');
  const title = document.getElementById('demoTitle');
  const description = document.getElementById('demoDescription');
  const badges = document.getElementById('demoBadges');
  const demos = new Map(config.demos.map((demo) => [demo.id, demo]));

  function requestedDemo() {
    const id = decodeURIComponent(window.location.hash.slice(1));
    return demos.get(id) || config.demos[0];
  }

  function renderBadges(demo) {
    badges.replaceChildren(...demo.badges.map((text) => {
      const badge = document.createElement('span');
      badge.className = 'dc-badge';
      badge.textContent = text;
      return badge;
    }));
  }

  function activate(demo, updateHistory) {
    if (!demo) return;
    tabs.querySelectorAll('.dc-tab').forEach((tab) => {
      const active = tab.dataset.demo === demo.id;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    title.textContent = demo.label;
    description.textContent = demo.description;
    renderBadges(demo);
    frame.classList.remove('ready');
    frame.title = `${demo.label}交互动画`;
    frame.src = `${demo.src}?embed=1`;
    if (updateHistory) history.pushState(null, '', `#${encodeURIComponent(demo.id)}`);
  }

  config.demos.forEach((demo) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'dc-tab';
    button.dataset.demo = demo.id;
    button.role = 'tab';
    button.textContent = demo.label;
    button.addEventListener('click', () => activate(demo, true));
    button.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const current = config.demos.findIndex((item) => item.id === demo.id);
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const next = config.demos[(current + direction + config.demos.length) % config.demos.length];
      activate(next, true);
      tabs.querySelector(`[data-demo="${next.id}"]`).focus();
    });
    tabs.appendChild(button);
  });

  frame.addEventListener('load', () => frame.classList.add('ready'));
  window.addEventListener('hashchange', () => activate(requestedDemo(), false));
  activate(requestedDemo(), false);
})();
