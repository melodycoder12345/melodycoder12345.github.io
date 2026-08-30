// Safe, composable content-block rendering for knowledge pages.
(function (global) {
  'use strict';

  var interactiveRenderers = Object.create(null);

  function element(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  function section(block, modifier) {
    var node = element('section', 'page-block page-block--' + modifier);
    if (block.id) node.id = String(block.id).replace(/[^a-zA-Z0-9_-]/g, '-');
    if (block.eyebrow) node.appendChild(element('div', 'page-block__eyebrow', block.eyebrow));
    if (block.title) node.appendChild(element('h2', 'page-block__title', block.title));
    return node;
  }

  function appendParagraphs(parent, value) {
    var paragraphs = Array.isArray(value) ? value : String(value || '').split(/\n\s*\n/);
    paragraphs.filter(Boolean).forEach(function (text) {
      parent.appendChild(element('p', 'page-block__paragraph', text));
    });
  }

  function renderSummary(block) {
    var node = section(block, 'summary');
    appendParagraphs(node, block.content || block.summary);
    return node;
  }

  function renderArticle(block) {
    var node = section(block, 'article');
    appendParagraphs(node, block.content || block.paragraphs);
    return node;
  }

  function renderConcepts(block) {
    var node = section(block, 'concepts');
    var grid = element('div', 'page-block__grid');
    (block.items || []).forEach(function (item) {
      var card = element('article', 'page-block__card');
      card.appendChild(element('h3', 'page-block__item-title', item.title || item.name));
      appendParagraphs(card, item.content || item.description);
      grid.appendChild(card);
    });
    node.appendChild(grid);
    return node;
  }

  function renderComparison(block) {
    var node = section(block, 'comparison');
    if (block.description) appendParagraphs(node, block.description);
    var table = element('table', 'page-block__table');
    var rows = block.rows || block.items || [];
    var columns = block.columns || inferColumns(rows);
    if (columns.length) {
      var headRow = document.createElement('tr');
      columns.forEach(function (column) {
        headRow.appendChild(element('th', '', column.label || column.key));
      });
      var thead = document.createElement('thead');
      thead.appendChild(headRow);
      table.appendChild(thead);
    }
    var tbody = document.createElement('tbody');
    rows.forEach(function (row) {
      var tr = document.createElement('tr');
      columns.forEach(function (column) {
        tr.appendChild(element('td', '', row[column.key]));
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    var scroll = element('div', 'page-block__table-scroll');
    scroll.appendChild(table);
    node.appendChild(scroll);
    return node;
  }

  function inferColumns(rows) {
    return rows.length && rows[0] && typeof rows[0] === 'object'
      ? Object.keys(rows[0]).map(function (key) { return { key: key, label: key }; })
      : [];
  }

  function renderCode(block) {
    var node = section(block, 'code');
    if (block.description) appendParagraphs(node, block.description);
    var pre = element('pre', 'page-block__pre');
    var code = element('code', block.language ? 'language-' + String(block.language).replace(/[^a-z0-9_-]/gi, '') : '', block.code || block.content);
    pre.appendChild(code);
    node.appendChild(pre);
    return node;
  }

  function renderCallout(block) {
    var tone = /^(info|tip|warning|danger)$/.test(block.tone) ? block.tone : 'info';
    var node = section(block, 'callout page-block--' + tone);
    appendParagraphs(node, block.content);
    return node;
  }

  function renderRelations(block, context) {
    var node = section(block, 'relations');
    if (typeof context.renderRelations === 'function') {
      var rendered = context.renderRelations(block, context);
      if (rendered && rendered.nodeType) node.appendChild(rendered);
    } else {
      node.appendChild(element('p', 'page-block__empty', block.emptyText || '知识关联将在关系数据加载后显示。'));
    }
    return node;
  }

  function renderInteractive(block, context) {
    var node = section(block, 'interactive');
    var renderer = interactiveRenderers[block.renderer];
    if (!renderer) {
      node.classList.add('page-block--fallback');
      node.appendChild(element('p', 'page-block__empty', block.fallback || '该互动内容暂时不可用，请稍后再试。'));
      return node;
    }
    try {
      var rendered = renderer(block.data || {}, { block: block, page: context.page || null });
      if (rendered && rendered.nodeType) node.appendChild(rendered);
      else throw new Error('Interactive renderer must return a DOM node.');
    } catch (error) {
      node.classList.add('page-block--fallback');
      node.appendChild(element('p', 'page-block__empty', block.fallback || '该互动内容暂时不可用，请稍后再试。'));
    }
    return node;
  }

  var renderers = {
    summary: renderSummary,
    article: renderArticle,
    concepts: renderConcepts,
    comparison: renderComparison,
    code: renderCode,
    callout: renderCallout,
    relations: renderRelations,
    interactive: renderInteractive
  };

  function renderBlocks(blocks, target, context) {
    var destination = typeof target === 'string' ? document.querySelector(target) : target;
    if (!destination || !destination.appendChild) throw new Error('PageBlocks.renderBlocks requires a valid target.');
    var fragment = document.createDocumentFragment();
    (Array.isArray(blocks) ? blocks : []).forEach(function (block) {
      if (!block || !renderers[block.type]) return;
      fragment.appendChild(renderers[block.type](block, context || {}));
    });
    destination.appendChild(fragment);
    return destination;
  }

  function registerInteractiveRenderer(name, renderer) {
    if (!name || typeof renderer !== 'function') throw new TypeError('A renderer name and function are required.');
    interactiveRenderers[name] = renderer;
    return function unregister() { delete interactiveRenderers[name]; };
  }

  global.PageBlocks = Object.freeze({
    registerInteractiveRenderer: registerInteractiveRenderer,
    renderBlocks: renderBlocks
  });
})(window);
