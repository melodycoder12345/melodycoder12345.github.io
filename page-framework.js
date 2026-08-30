// Adaptive learning guide for knowledge detail pages.
(function () {
  'use strict';

  if (window.__pageFrameworkLoaded) return;
  window.__pageFrameworkLoaded = true;

  function build() {
    if (!document.body.classList.contains('sn-detail-body')) return;
    var current = currentNode();
    if (!current || typeof window.getPageProfile !== 'function') return;
    var profile = window.getPageProfile(current.id);
    if (!profile) return;

    classifyLayout(profile);

    var grouped = window.KnowledgeRelations
      ? window.KnowledgeRelations.group(current.id)
      : fallbackGroups(current.id);
    var popover = createHelp(profile, current, grouped);
    var title = placeHelp(popover);
    injectStyle();
    if (title) bindHelp(title, popover);
    buildReadingNavigation();
    // nav.js classifies historical reading shells after adapting their layout.
    // Recheck once that asynchronous classification has settled; the builder
    // is idempotent and therefore cannot duplicate the navigation.
    window.setTimeout(buildReadingNavigation, 260);

    if (Array.isArray(window.PAGE_BLOCKS) && window.PageBlocks) {
      var host = document.createElement('section');
      host.id = '__page-blocks';
      document.body.appendChild(host);
      window.PageBlocks.renderBlocks(window.PAGE_BLOCKS, host, { page: profile, node: current });
    }
  }

  function placeHelp(popover) {
    var selectors = [
      'nav:not(#__snav) h1',
      'header:not(#__snav) h1',
      '.page-header h1',
      '.hero > :first-child h1',
      '.hero h1',
      '.nav-bar .nav-title',
      '.topbar .nav-title',
      '.title-bar .nav-title',
      '.page-title',
      '.sp-head .sp-title',
      '.lp-head .lp-title',
      '.topnav .topnav-title',
      'main > h1',
      '.content > h1',
      'body > h1'
    ];
    var title = null;
    selectors.some(function (selector) {
      title = Array.from(document.querySelectorAll(selector)).find(isPageTitle) || null;
      return Boolean(title);
    });
    if (!title) return null;
    if (title.tagName !== 'H1') {
      title.setAttribute('role', 'heading');
      title.setAttribute('aria-level', '1');
    }
    title.classList.add('pf-help-title');
    title.setAttribute('tabindex', '0');
    title.setAttribute('aria-haspopup', 'dialog');
    title.setAttribute('aria-expanded', 'false');
    title.setAttribute('aria-controls', '__learning-help');
    document.body.appendChild(popover);
    return title;
  }

  // Profiles are useful hints, but many older pages still use the default
  // "article / none" values. Prefer observable page structure so the class
  // remains useful while those profiles are gradually corrected.
  function classifyLayout(profile) {
    var body = document.body;
    var presentations = Array.isArray(profile.presentations) ? profile.presentations : [];
    var interaction = profile.interaction || 'none';
    var hasFullscreenLab = Boolean(
      document.querySelector('.viz-panel') &&
      document.querySelector('.code-panel')
    );
    var hasProtocolLab = Boolean(
      document.querySelector('.hero') &&
      document.querySelector('.lab')
    );
    var hasInteractiveRegion = Boolean(document.querySelector(
      '.lab, .playground, .simulator, .visualization, .viz-panel, [data-step], .step-btn'
    ));
    var hasHero = Boolean(document.querySelector('.hero'));
    var hasArticleRegion = Boolean(document.querySelector(
      'article, .article, .deep, .prose, .markdown-body, .content section'
    ));
    var layout = 'article';
    var source = 'dom:reading-content';

    if (hasFullscreenLab) {
      layout = 'fullscreen-lab';
      source = 'dom:viz-panel+code-panel';
    } else if (hasProtocolLab) {
      layout = 'protocol-lab';
      source = 'dom:hero+lab+stage';
    } else if (hasHero && (hasInteractiveRegion || hasArticleRegion)) {
      layout = 'hybrid';
      source = 'dom:hero+interactive-or-article';
    } else if (interaction !== 'none' || presentations.some(function (value) {
      return /lab|visual|interactive|animation|playground|simulator/i.test(value);
    })) {
      layout = hasHero ? 'hybrid' : 'fullscreen-lab';
      source = 'profile:' + interaction + '+' + presentations.join(',');
    } else if (hasHero) {
      layout = 'hybrid';
      source = 'dom:hero';
    }

    ['fullscreen-lab', 'protocol-lab', 'article', 'hybrid'].forEach(function (name) {
      body.classList.remove('pf-layout-' + name);
    });
    body.classList.add('pf-layout-' + layout);
    body.setAttribute('data-pf-layout', layout);
    body.setAttribute('data-pf-layout-source', source);
  }

  function isPageTitle(element) {
    if (!element || element.closest('#__snav, #__learning-help, article section, main section:not(.hero), .deep, .lab, .panel')) return false;
    if (/^(H1|SPAN|DIV)$/.test(element.tagName) === false) return false;
    var text = (element.textContent || '').replace(/\s+/g, ' ').trim();
    if (!text) return false;
    // Historical .nav-title elements are accepted only from a real page-level
    // header/nav, preventing similarly named labels inside article sections.
    if (element.classList.contains('nav-title') && !element.closest('nav, header, .page-header, .nav-bar, .topbar, .title-bar')) return false;
    if (element.classList.contains('page-title') &&
        !element.closest('header, nav, .page-header, .hero') &&
        element.parentElement !== document.body &&
        !element.parentElement.matches('main, .content')) return false;
    // Full-screen labs already contain a concise title in their left header.
    // Reuse it instead of inserting a second title bar that would reduce the
    // visualization area or duplicate existing content.
    if (element.classList.contains('sp-title') && !element.closest('.sp-head')) return false;
    if (element.classList.contains('lp-title') && !element.closest('.lp-head')) return false;
    if (element.classList.contains('topnav-title') && !element.closest('.topnav')) return false;
    return true;
  }

  function createHelp(profile, current, groups) {
    var items = contextItems(groups);
    var help = document.createElement('section');
    help.id = '__learning-help';
    help.className = 'pf-help-popover';
    help.setAttribute('aria-hidden', 'true');
    help.innerHTML =
        '<header class="pf-help-head"><span>学习指南</span><strong>' + escapeHtml(current.label) + '</strong></header>' +
        '<div class="pf-help-body">' +
          '<section class="pf-help-objective"><h3>学习目标</h3><p>' + escapeHtml(profile.learning.objective) + '</p></section>' +
          (items.length ? '<section class="pf-help-relations"><h3>知识关系 <b>' + items.length + '</b></h3>' + items.map(renderHelpRelation).join('') + '</section>' : '') +
          '<a class="pf-help-graph" href="' + rootPath() + 'graph.html?node=' + encodeURIComponent(current.id) + '">在知识星图中查看全部 ↗</a>' +
        '</div>';
    return help;
  }

  function contextItems(groups) {
    return groups.before.map(function (item) { return { item: item, label: '学习前置' }; })
      .concat(groups.related.map(function (item) { return { item: item, label: relationLabel(item.relation.type) }; }))
      .concat(groups.next.map(function (item) { return { item: item, label: '继续学习' }; }));
  }

  function renderHelpRelation(entry) {
    return '<a class="pf-help-relation" href="' + rootPath() + entry.item.node.href + '">' +
      '<span>' + escapeHtml(entry.label) + '</span><strong>' + escapeHtml(entry.item.node.label) + '</strong>' +
      '<p>' + escapeHtml(entry.item.relation.summary) + '</p></a>';
  }

  function relationLabel(type) {
    var relationTypes = window.KNOWLEDGE_RELATION_TYPES || {};
    return relationTypes[type] ? relationTypes[type].label : type;
  }

  function bindHelp(title, popover) {
    var pinned = false;
    var closeTimer = 0;

    function positionPopover() {
      var titleRect = title.getBoundingClientRect();
      var width = Math.min(430, window.innerWidth - 24);
      var left = Math.max(12, Math.min(titleRect.left, window.innerWidth - width - 12));
      var top = titleRect.bottom + 9;
      popover.style.left = Math.round(left) + 'px';
      popover.style.top = Math.round(top) + 'px';
      popover.style.width = Math.round(width) + 'px';
    }

    function open() {
      window.clearTimeout(closeTimer);
      positionPopover();
      popover.classList.add('is-open');
      popover.setAttribute('aria-hidden', 'false');
      title.setAttribute('aria-expanded', 'true');
    }

    function close(force) {
      if (pinned && !force) return;
      pinned = false;
      popover.classList.remove('is-open');
      popover.setAttribute('aria-hidden', 'true');
      title.setAttribute('aria-expanded', 'false');
    }

    function scheduleClose() {
      window.clearTimeout(closeTimer);
      closeTimer = window.setTimeout(function () { close(false); }, 140);
    }

    title.addEventListener('mouseenter', open);
    title.addEventListener('mouseleave', scheduleClose);
    title.addEventListener('focus', open);
    title.addEventListener('blur', scheduleClose);
    title.addEventListener('click', function (event) {
      event.stopPropagation();
      pinned = !pinned;
      if (pinned) open(); else close(true);
    });
    popover.addEventListener('mouseenter', function () { window.clearTimeout(closeTimer); });
    popover.addEventListener('mouseleave', scheduleClose);
    popover.addEventListener('focusin', open);
    popover.addEventListener('focusout', scheduleClose);
    document.addEventListener('click', function (event) {
      if (!popover.contains(event.target) && event.target !== title) close(true);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        close(true);
        title.focus();
      }
    });
    window.addEventListener('resize', function () { if (popover.classList.contains('is-open')) positionPopover(); });
    window.addEventListener('scroll', function () { if (popover.classList.contains('is-open')) positionPopover(); }, true);
  }

  // Add navigation around long articles without moving or rewriting their content.
  // Interactive labs deliberately keep their full canvas and control area.
  function buildReadingNavigation() {
    var body = document.body;
    if (!body.classList.contains('sn-reading-page')) return;
    if (body.classList.contains('pf-layout-fullscreen-lab') || body.classList.contains('pf-layout-protocol-lab')) return;
    if (document.getElementById('__reading-navigation')) return;

    var root = document.querySelector('.main-content, main.prose, article.prose, .article-content, article, main');
    if (!root || (root.textContent || '').replace(/\s+/g, ' ').trim().length < 7000) return;
    var headings = Array.from(root.querySelectorAll('h2')).filter(function (heading) {
      return !heading.closest('.hero, .lab, .playground, .simulator, .visualization, .viz-panel, .code-panel, nav, aside, #__page-blocks');
    });
    if (headings.length < 6) return;
    var nativeNavigation = document.querySelector('.side-nav, .toc, #toc, .table-of-contents, [data-toc]');
    buildReadingProgress();
    if (nativeNavigation && nativeNavigation.matches('.side-nav')) {
      enhanceNativeReadingNavigation(nativeNavigation);
    }

    var usedIds = Object.create(null);
    Array.from(document.querySelectorAll('[id]')).forEach(function (element) {
      if (element.id) usedIds[element.id] = true;
    });
    headings.forEach(function (heading, index) {
      if (!heading.id) heading.id = uniqueHeadingId(heading.textContent, index, usedIds);
      heading.classList.add('pf-reading-heading');
    });

    var mobile = window.matchMedia && window.matchMedia('(max-width: 900px)').matches;
    var wideScreen = window.matchMedia && window.matchMedia('(min-width: 1680px)').matches;
    var defaultOpen = !nativeNavigation && wideScreen;
    var navigation = document.createElement('aside');
    navigation.id = '__reading-navigation';
    navigation.className = 'pf-reading-navigation' + (nativeNavigation ? ' has-native-navigation' : '') + (defaultOpen ? ' is-open' : '');
    navigation.setAttribute('aria-label', '文章阅读导航');
    navigation.innerHTML =
      '<button class="pf-reading-toggle" type="button" aria-expanded="' + String(defaultOpen) + '" aria-controls="__reading-toc">' +
        '<span>本文目录</span><span class="pf-reading-toggle-icon" aria-hidden="true">⌄</span>' +
      '</button>' +
      '<nav id="__reading-toc" class="pf-reading-toc" aria-label="本文目录"' + (defaultOpen ? '' : ' hidden') + '>' +
        '<ol>' + headings.map(function (heading) {
          return '<li><a href="#' + encodeURIComponent(heading.id) + '">' + escapeHtml((heading.textContent || '').trim()) + '</a></li>';
        }).join('') + '</ol>' +
      '</nav>';
    document.body.appendChild(navigation);

    var button = navigation.querySelector('.pf-reading-toggle');
    var toc = navigation.querySelector('.pf-reading-toc');
    var links = Array.from(toc.querySelectorAll('a'));
    button.addEventListener('click', function () {
      var open = navigation.classList.toggle('is-open');
      button.setAttribute('aria-expanded', String(open));
      toc.hidden = !open;
    });
    links.forEach(function (link, index) {
      link.addEventListener('click', function () {
        setActiveReadingLink(links, index);
        if (window.matchMedia && window.matchMedia('(max-width: 900px)').matches) {
          navigation.classList.remove('is-open');
          button.setAttribute('aria-expanded', 'false');
          toc.hidden = true;
        }
      });
    });
    observeReadingHeadings(headings, links);
    if (nativeNavigation) {
      var nativePairs = Array.from(nativeNavigation.querySelectorAll('a[href^="#"]')).map(function (link) {
        var id = decodeURIComponent((link.getAttribute('href') || '').slice(1));
        return { link: link, target: id ? document.getElementById(id) : null };
      }).filter(function (pair) { return Boolean(pair.target); });
      if (nativePairs.length > 1) {
        observeReadingHeadings(
          nativePairs.map(function (pair) { return pair.target; }),
          nativePairs.map(function (pair) { return pair.link; })
        );
      }
    }
  }

  function buildReadingProgress() {
    if (document.getElementById('__reading-progress')) return;
    var progress = document.createElement('div');
    progress.id = '__reading-progress';
    progress.className = 'pf-reading-progress';
    progress.setAttribute('role', 'progressbar');
    progress.setAttribute('aria-label', '阅读进度');
    progress.setAttribute('aria-valuemin', '0');
    progress.setAttribute('aria-valuemax', '100');
    progress.setAttribute('aria-valuenow', '0');
    progress.innerHTML = '<span class="pf-reading-progress-value"></span>';

    var backTop = document.createElement('button');
    backTop.id = '__reading-backtop';
    backTop.className = 'pf-reading-backtop';
    backTop.type = 'button';
    backTop.title = '返回顶部';
    backTop.setAttribute('aria-label', '返回顶部');
    backTop.innerHTML = '<span aria-hidden="true">↑</span>';
    document.body.appendChild(progress);
    document.body.appendChild(backTop);

    var value = progress.querySelector('.pf-reading-progress-value');
    var scheduled = false;
    function update() {
      var root = document.documentElement;
      var top = window.scrollY || root.scrollTop || 0;
      var total = Math.max(1, root.scrollHeight - window.innerHeight);
      var ratio = Math.max(0, Math.min(1, top / total));
      value.style.transform = 'scaleX(' + ratio + ')';
      progress.setAttribute('aria-valuenow', String(Math.round(ratio * 100)));
      backTop.classList.toggle('is-visible', top > 480 && ratio > 0.04);
    }
    function requestUpdate() {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(function () {
        scheduled = false;
        update();
      });
    }
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate, { passive: true });
    backTop.addEventListener('click', function () {
      var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    update();
  }

  function enhanceNativeReadingNavigation(navigation) {
    if (navigation.querySelector('.pf-native-toc-toggle')) return;
    var label = navigation.tagName === 'NAV' ? navigation.getAttribute('aria-label') : null;
    if (!label) navigation.setAttribute('aria-label', '文章章节目录');

    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'pf-native-toc-toggle';
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', '收起文章目录');
    toggle.title = '收起目录';
    toggle.innerHTML = '<span class="pf-native-toc-toggle-icon" aria-hidden="true">‹</span>';
    navigation.insertBefore(toggle, navigation.firstChild);

    toggle.addEventListener('click', function () {
      var collapsed = navigation.classList.toggle('is-collapsed');
      toggle.setAttribute('aria-expanded', String(!collapsed));
      toggle.setAttribute('aria-label', collapsed ? '展开文章目录' : '收起文章目录');
      toggle.title = collapsed ? '展开目录' : '收起目录';
    });
  }

  function uniqueHeadingId(text, index, usedIds) {
    var base = String(text || '').trim().toLowerCase()
      .replace(/[^\w\u3400-\u9fff-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'section-' + (index + 1);
    var candidate = 'reading-' + base;
    var suffix = 2;
    while (usedIds[candidate]) candidate = 'reading-' + base + '-' + suffix++;
    usedIds[candidate] = true;
    return candidate;
  }

  function setActiveReadingLink(links, activeIndex) {
    links.forEach(function (link, index) {
      link.classList.toggle('is-active', index === activeIndex);
      if (index === activeIndex) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  function observeReadingHeadings(headings, links) {
    var activeIndex = 0;
    function update() {
      var threshold = Math.max(76, window.innerHeight * 0.2);
      headings.forEach(function (heading, index) {
        if (heading.getBoundingClientRect().top <= threshold) activeIndex = index;
      });
      setActiveReadingLink(links, activeIndex);
    }
    update();
    var scheduled = false;
    window.addEventListener('scroll', function () {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(function () {
        scheduled = false;
        update();
      });
    }, { passive: true });
    window.addEventListener('resize', update, { passive: true });
  }

  function fallbackGroups(id) {
    var result = { before: [], related: [], next: [] };
    var nodes = Object.fromEntries((window.GRAPH_NODES || []).map(function (node) { return [node.id, node]; }));
    (window.KNOWLEDGE_RELATIONS || []).forEach(function (relation) {
      if (relation.source !== id && relation.target !== id) return;
      var outgoing = relation.source === id;
      var item = { relation: relation, node: nodes[outgoing ? relation.target : relation.source], outgoing: outgoing };
      if (!item.node) return;
      if (relation.type === 'prerequisite') (outgoing ? result.next : result.before).push(item);
      else result.related.push(item);
    });
    return result;
  }

  function currentNode() {
    var path = window.location.pathname.replace(/^.*\/(algo|db|kafka|redis|linux|network|cs|golang|distributed|ai|system-design|cloud-native|observability|security|testing)\//, '$1/');
    return (window.GRAPH_NODES || []).find(function (node) { return node.type === 'page' && node.href === path; });
  }

  function rootPath() { return /\/(algo|db|kafka|redis|linux|network|cs|golang|distributed|ai|system-design|cloud-native|observability|security|testing)\//.test(window.location.pathname) ? '../' : ''; }
  function escapeHtml(value) { return String(value || '').replace(/[&<>"']/g, function (char) { return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]; }); }

  function injectStyle() {
    if (document.getElementById('__page-framework-style')) return;
    var style = document.createElement('style');
    style.id = '__page-framework-style';
    style.textContent = [
      '.pf-help-title{width:fit-content;max-width:100%;cursor:help;transition:color .14s,text-shadow .14s}',
      'body.pf-layout-fullscreen-lab,body.pf-layout-protocol-lab,body.pf-layout-article,body.pf-layout-hybrid{--pf-content-wide:1220px;--pf-reading-width:920px}',
      '.pf-help-title:hover,.pf-help-title:focus-visible{color:#f8fafc;text-shadow:0 0 18px rgba(125,211,252,.12);outline:0}',
      '.pf-help-popover{position:fixed;max-height:min(650px,calc(100vh - 24px));overflow:hidden;display:flex;flex-direction:column;border:1px solid rgba(148,163,184,.18);border-radius:12px;background:#111827;color:#e2e8f0;box-shadow:0 22px 60px rgba(0,0,0,.55);opacity:0;visibility:hidden;transform:translateY(-5px);pointer-events:none;transition:opacity .14s,transform .14s,visibility .14s;z-index:9000;font-family:"Segoe UI",system-ui,-apple-system,sans-serif}',
      '.pf-help-popover.is-open{opacity:1;visibility:visible;transform:translateY(0);pointer-events:auto}',
      '.pf-help-head{padding:15px 17px 13px;border-bottom:1px solid rgba(148,163,184,.12)}',
      '.pf-help-head span{display:block;margin-bottom:5px;color:#64748b;font-size:.59rem;letter-spacing:.12em}',
      '.pf-help-head strong{color:#f8fafc;font-size:.96rem}',
      '.pf-help-body{padding:14px 17px 16px;overflow-y:auto}',
      '.pf-help-body h3{margin:0 0 8px;color:#94a3b8;font-size:.68rem;letter-spacing:.07em}',
      '.pf-help-body h3 b{margin-left:4px;color:#64748b;font-weight:500}',
      '.pf-help-objective p{margin:0;color:#cbd5e1;font-size:.78rem;line-height:1.65}',
      '.pf-help-relations{margin-top:15px;padding-top:14px;border-top:1px solid rgba(148,163,184,.1)}',
      '.pf-help-relation{display:block;padding:9px 7px;color:inherit;text-decoration:none;border-radius:7px;border-top:1px solid rgba(148,163,184,.08)}',
      '.pf-help-relation:nth-of-type(1){border-top:0}',
      '.pf-help-relation:hover{background:rgba(56,189,248,.065)}',
      '.pf-help-relation span{display:inline-block;margin-right:7px;padding:2px 5px;border-radius:999px;background:rgba(56,189,248,.09);color:#7dd3fc;font-size:.59rem}',
      '.pf-help-relation strong{color:#f1f5f9;font-size:.78rem}',
      '.pf-help-relation p{margin:4px 0 0;color:#94a3b8;font-size:.7rem;line-height:1.5}',
      '.pf-help-graph{display:inline-block;margin-top:12px;color:#7dd3fc;text-decoration:none;font-size:.7rem}',
      'body:is(.pf-layout-protocol-lab,.pf-layout-hybrid) .content{padding-top:clamp(24px,2.4vw,32px)}',
      'body:is(.pf-layout-protocol-lab,.pf-layout-hybrid) .hero{margin-bottom:clamp(18px,2vw,24px)}',
      'body:is(.pf-layout-protocol-lab,.pf-layout-hybrid) .hero>.card{padding:clamp(20px,2.2vw,24px)}',
      'body:is(.pf-layout-protocol-lab,.pf-layout-hybrid) .hero h1{font-size:clamp(2rem,3.6vw,3.7rem);line-height:1.06;margin-bottom:12px}',
      'body:is(.pf-layout-protocol-lab,.pf-layout-hybrid) .hero .summary{max-width:72ch;line-height:1.7}',
      'body:is(.pf-layout-protocol-lab,.pf-layout-hybrid) .hero .tags{margin-top:16px}',
      'body:is(.pf-layout-protocol-lab,.pf-layout-hybrid) :is(article,.article,.prose,.markdown-body){line-height:1.75}',
      'body:is(.pf-layout-protocol-lab,.pf-layout-hybrid) :is(article,.article,.prose,.markdown-body)>:is(h2,h3){scroll-margin-top:76px}',
      'body.pf-layout-protocol-lab .content{padding-top:clamp(24px,2.4vw,32px)!important}',
      'body.pf-layout-protocol-lab .hero{grid-template-columns:minmax(0,1fr) minmax(300px,340px)!important;gap:18px!important;margin-bottom:18px!important}',
      'body.pf-layout-protocol-lab .hero>.card{padding:20px!important;border-radius:18px!important}',
      'body.pf-layout-protocol-lab .hero h1{font-size:clamp(2rem,3.4vw,3.6rem)!important;line-height:1.06!important;margin-bottom:12px!important}',
      'body.pf-layout-protocol-lab .hero .summary{line-height:1.68!important}',
      'body.pf-layout-protocol-lab .hero .tags{margin-top:16px!important}',
      'body.pf-layout-protocol-lab .hero .concept-list{gap:8px!important}',
      'body.pf-layout-protocol-lab .hero .concept-list li{padding:11px 12px!important}',
      'body.pf-layout-protocol-lab .hero .concept-list strong{font-size:.82rem!important;margin-bottom:2px!important}',
      'body.pf-layout-protocol-lab .hero .concept-list span{font-size:.76rem!important;line-height:1.5!important}',
      'body.pf-layout-protocol-lab .lab{gap:14px!important}',
      '#__page-blocks{width:min(1100px,calc(100% - 32px));margin:36px auto;color:#e2e8f0}',
      '.page-block{margin:0 0 28px;padding:22px;border:1px solid rgba(148,163,184,.16);border-radius:16px;background:rgba(15,23,42,.72)}',
      '.page-block__title{margin:0 0 14px;font-size:1.2rem}.page-block__paragraph{color:#cbd5e1;line-height:1.75}',
      '.page-block__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}.page-block__card{padding:14px;border-radius:12px;background:rgba(255,255,255,.035)}',
      '.page-block__table-scroll,.page-block__pre{overflow:auto}.page-block__table{width:100%;border-collapse:collapse}.page-block__table th,.page-block__table td{padding:10px;border-bottom:1px solid rgba(148,163,184,.14);text-align:left}',
      '.pf-reading-heading{scroll-margin-top:calc(var(--snav-h,44px) + 24px)}',
      '.pf-reading-progress{position:fixed;top:var(--snav-h,44px);left:0;right:0;height:2px;z-index:8050;pointer-events:none;background:rgba(148,163,184,.08)}',
      '.pf-reading-progress-value{display:block;width:100%;height:100%;transform:scaleX(0);transform-origin:left center;background:linear-gradient(90deg,#38bdf8,#34d399);box-shadow:0 0 8px rgba(56,189,248,.42);will-change:transform}',
      '.pf-reading-backtop{position:fixed;right:clamp(14px,2vw,28px);bottom:76px;z-index:7890;width:40px;height:40px;display:grid;place-items:center;border:1px solid rgba(148,163,184,.2);border-radius:11px;background:rgba(15,23,42,.92);color:#7dd3fc;font:700 1rem/1 system-ui;box-shadow:0 10px 28px rgba(0,0,0,.28);backdrop-filter:blur(10px);cursor:pointer;opacity:0;visibility:hidden;transform:translateY(8px);pointer-events:none;transition:opacity .16s,transform .16s,visibility .16s,border-color .16s}',
      '.pf-reading-backtop:hover{border-color:rgba(56,189,248,.52);color:#e0f2fe}.pf-reading-backtop:focus-visible{outline:2px solid #38bdf8;outline-offset:2px}.pf-reading-backtop.is-visible{opacity:1;visibility:visible;transform:translateY(0);pointer-events:auto}',
      '.pf-reading-navigation{position:fixed;right:clamp(12px,2vw,28px);bottom:24px;z-index:7900;width:min(260px,calc(100vw - 24px));border:1px solid rgba(148,163,184,.18);border-radius:12px;background:rgba(15,23,42,.94);color:#e2e8f0;box-shadow:0 14px 38px rgba(0,0,0,.35);backdrop-filter:blur(10px);font-family:"Segoe UI",system-ui,-apple-system,sans-serif;overflow:hidden}',
      '.pf-reading-navigation.has-native-navigation{display:none}',
      '.pf-reading-navigation:not(.is-open){width:auto;min-width:92px}',
      '.pf-reading-toggle{display:flex;width:100%;align-items:center;justify-content:space-between;gap:12px;padding:11px 13px;border:0;background:transparent;color:inherit;font:600 .78rem/1.2 inherit;cursor:pointer;text-align:left}',
      '.pf-reading-toggle:focus-visible,.pf-reading-toc a:focus-visible{outline:2px solid #38bdf8;outline-offset:-2px}',
      '.pf-reading-toggle-icon{color:#7dd3fc;transition:transform .18s}.pf-reading-navigation.is-open .pf-reading-toggle-icon{transform:rotate(180deg)}',
      '.pf-reading-toc{border-top:1px solid rgba(148,163,184,.12);max-height:min(50vh,440px);overflow:auto;overscroll-behavior:contain;scrollbar-width:thin}',
      '.pf-reading-toc[hidden]{display:none}.pf-reading-toc ol{margin:0;padding:7px 0;list-style:none}',
      '.pf-reading-toc a{display:block;padding:7px 13px;border-left:2px solid transparent;color:#94a3b8;text-decoration:none;font-size:.73rem;line-height:1.35;transition:color .14s,background .14s,border-color .14s}',
      '.pf-reading-toc a:hover{color:#e2e8f0;background:rgba(148,163,184,.07)}.pf-reading-toc a.is-active{border-left-color:#38bdf8;color:#7dd3fc;background:rgba(56,189,248,.07)}',
      'body.sn-reading-page .side-nav a.is-active{color:#7dd3fc;background:rgba(56,189,248,.08);box-shadow:inset 2px 0 #38bdf8}',
      'body.sn-reading-page .side-nav{transition:width .18s,min-width .18s,padding .18s}',
      '.pf-native-toc-toggle{display:grid;place-items:center;width:28px;height:28px;margin:0 6px 10px auto;padding:0;border:1px solid rgba(148,163,184,.18);border-radius:8px;background:rgba(15,23,42,.5);color:#94a3b8;font:700 1rem/1 system-ui;cursor:pointer;transition:color .14s,border-color .14s,background .14s}',
      '.pf-native-toc-toggle:hover{color:#7dd3fc;border-color:rgba(56,189,248,.42);background:rgba(56,189,248,.07)}.pf-native-toc-toggle:focus-visible{outline:2px solid #38bdf8;outline-offset:2px}',
      '.pf-native-toc-toggle-icon{transition:transform .18s}',
      'body.sn-reading-page .side-nav.is-collapsed{width:40px!important;min-width:40px!important;padding-inline:0!important;overflow:visible}',
      'body.sn-reading-page .side-nav.is-collapsed>:not(.pf-native-toc-toggle){display:none!important}',
      'body.sn-reading-page .side-nav.is-collapsed .pf-native-toc-toggle{margin-inline:auto}',
      'body.sn-reading-page .side-nav.is-collapsed .pf-native-toc-toggle-icon{transform:rotate(180deg)}',
      '@media(prefers-reduced-motion:reduce){.pf-reading-toggle-icon,.pf-reading-toc a,.pf-reading-backtop,.pf-native-toc-toggle-icon,body.sn-reading-page .side-nav{transition:none}}',
      '@media(min-width:1680px){.pf-reading-navigation:not(.has-native-navigation){top:calc(var(--snav-h,44px) + 76px);bottom:auto}}',
      '@media(max-width:900px){.pf-reading-navigation.has-native-navigation{display:block}.pf-reading-navigation{right:12px;bottom:12px}.pf-reading-backtop{right:14px;bottom:66px}.pf-reading-toc{max-height:min(46dvh,360px)}.pf-native-toc-toggle{display:none}}',
      '@media(max-width:760px){.pf-help-popover{max-height:calc(100dvh - 16px)}}'
    ].join('');
    document.head.appendChild(style);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
