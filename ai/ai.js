(function () {
  'use strict';

  const demo = window.AI_DEMO;
  if (!demo) return;

  const $ = (id) => document.getElementById(id);
  const state = { index: 0, timer: null };
  const markerId = 'arr-' + Math.random().toString(36).slice(2);

  function el(name, attrs, parent) {
    const node = document.createElementNS('http://www.w3.org/2000/svg', name);
    Object.entries(attrs || {}).forEach(([key, value]) => node.setAttribute(key, value));
    if (parent) parent.appendChild(node);
    return node;
  }

  function makeNode(svg, node) {
    const g = el('g', { id: 'node-' + node.id, class: 'ai-node', transform: `translate(${node.x},${node.y})` }, svg);
    if (node.shape === 'circle') {
      el('circle', { cx: 0, cy: 0, r: node.r || 36 }, g);
    } else if (node.shape === 'diamond') {
      const w = node.w || 92, h = node.h || 58;
      el('polygon', { points: `0,${-h / 2} ${w / 2},0 0,${h / 2} ${-w / 2},0` }, g);
    } else {
      const w = node.w || 112, h = node.h || 54;
      el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 12 }, g);
    }
    el('text', { x: 0, y: -4, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 800 }, g).textContent = node.label;
    el('text', { x: 0, y: 13, 'text-anchor': 'middle', 'font-size': 8.5, fill: '#65728f' }, g).textContent = node.sub || '';
  }

  function buildSvg() {
    const mount = $('aiStage');
    if (!mount) return;
    mount.textContent = '';
    const svg = el('svg', { class: 'ai-svg', viewBox: demo.viewBox || '0 0 560 360', role: 'img', 'aria-label': demo.title || 'AI animation' }, mount);
    const defs = el('defs', {}, svg);
    const marker = el('marker', { id: markerId, markerWidth: 8, markerHeight: 8, refX: 6, refY: 3, orient: 'auto' }, defs);
    el('path', { d: 'M0,0 L0,6 L8,3 z', fill: 'rgba(255,255,255,.25)' }, marker);
    const edgesLayer = el('g', { id: 'edgeLayer' }, svg);
    const nodesLayer = el('g', { id: 'nodeLayer' }, svg);
    (demo.edges || []).forEach((edge) => {
      el('line', {
        id: 'edge-' + edge.id,
        class: 'ai-edge',
        x1: edge.x1,
        y1: edge.y1,
        x2: edge.x2,
        y2: edge.y2,
        'marker-end': `url(#${markerId})`
      }, edgesLayer);
    });
    (demo.nodes || []).forEach((node) => makeNode(nodesLayer, node));
  }

  function buildSteps() {
    const list = $('stepList');
    if (!list) return;
    list.textContent = '';
    demo.steps.forEach((step, index) => {
      const button = document.createElement('button');
      button.className = 'step-btn';
      button.type = 'button';
      button.innerHTML = `<b>${String(index + 1).padStart(2, '0')} · ${step.kicker || 'step'}</b>${step.title}`;
      button.addEventListener('click', () => {
        stop();
        setStep(index);
      });
      list.appendChild(button);
    });
  }

  function clearClasses() {
    document.querySelectorAll('.ai-node,.ai-edge').forEach((node) => {
      node.classList.remove('active', 'good', 'warn', 'bad');
    });
  }

  function applyClasses(ids, prefix, cls) {
    (ids || []).forEach((id) => {
      const node = $(prefix + id);
      if (node) node.classList.add(cls);
    });
  }

  function setStep(index) {
    state.index = Math.max(0, Math.min(index, demo.steps.length - 1));
    const step = demo.steps[state.index];
    clearClasses();
    applyClasses(step.nodes, 'node-', 'active');
    applyClasses(step.goodNodes, 'node-', 'good');
    applyClasses(step.warnNodes, 'node-', 'warn');
    applyClasses(step.badNodes, 'node-', 'bad');
    applyClasses(step.edges, 'edge-', 'active');
    applyClasses(step.warnEdges, 'edge-', 'warn');
    applyClasses(step.badEdges, 'edge-', 'bad');

    document.querySelectorAll('.step-btn').forEach((btn, i) => btn.classList.toggle('active', i === state.index));
    $('stepTitle').textContent = step.title;
    $('stepDesc').textContent = step.desc;
    $('stepDetail').textContent = step.detail || '';
    const badge = $('stateBadge');
    badge.textContent = step.badge || 'normal';
    badge.className = 'badge ' + (step.tone || '');

    const metrics = $('metrics');
    metrics.textContent = '';
    (step.metrics || []).forEach((metric) => {
      const item = document.createElement('div');
      item.className = 'metric';
      item.innerHTML = `<span>${metric.label}</span><strong>${metric.value}</strong>`;
      metrics.appendChild(item);
    });

    const code = $('codeBlock');
    if (code) code.textContent = step.code || demo.code || '';
    $('btnPrev').disabled = state.index === 0;
    $('btnNext').disabled = state.index === demo.steps.length - 1;
  }

  function stop() {
    if (state.timer) clearInterval(state.timer);
    state.timer = null;
    $('btnPlay').textContent = '播放';
  }

  function getInterval() {
    const sr = document.getElementById('speedRange');
    if (sr) {
      const SPEED = [2000,1200,700,350,120];
      return SPEED[parseInt(sr.value) - 1];
    }
    return demo.interval || 1400;
  }

  function play() {
    if (state.timer) {
      stop();
      return;
    }
    $('btnPlay').textContent = '暂停';
    state.timer = setInterval(() => {
      if (state.index >= demo.steps.length - 1) {
        stop();
        return;
      }
      setStep(state.index + 1);
    }, getInterval());
  }

  function init() {
    buildSvg();
    buildSteps();
    $('btnReset').addEventListener('click', () => {
      stop();
      setStep(0);
    });
    $('btnPrev').addEventListener('click', () => {
      stop();
      setStep(state.index - 1);
    });
    $('btnNext').addEventListener('click', () => {
      stop();
      setStep(state.index + 1);
    });
    $('btnPlay').addEventListener('click', play);
    setStep(0);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
