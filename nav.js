// Shared nav bar — load this in <head> for zero layout-shift
(function () {
  'use strict';
  const d = document;
  if (d.getElementById('__snav')) return;

  const embeddedDemo = new URLSearchParams(window.location.search).get('embed') === '1';
  const consolidatedPages = {
    '/algo/bubble-sort.html': 'sorting.html#bubble-sort',
    '/algo/selection-sort.html': 'sorting.html#selection-sort',
    '/algo/insertion-sort.html': 'sorting.html#insertion-sort',
    '/algo/merge-sort.html': 'sorting.html#merge-sort',
    '/algo/quick-sort.html': 'sorting.html#quick-sort',
    '/algo/heap-sort.html': 'sorting.html#heap-sort',
    '/algo/counting-sort.html': 'sorting.html#counting-sort',
    '/algo/radix-sort.html': 'sorting.html#radix-sort',
    '/distributed/raft.html': 'consensus.html#raft',
    '/distributed/paxos.html': 'consensus.html#paxos',
    '/distributed/2pc.html': 'transactions.html#2pc',
    '/distributed/saga.html': 'transactions.html#saga',
    '/distributed/3pc.html': 'transactions.html#3pc',
    '/observability/opentelemetry.html': 'tracing-platform.html#otel',
    '/observability/tracing.html': 'tracing-platform.html#trace-waterfall',
    '/distributed/distributed-tracing.html': '../observability/tracing-platform.html#distributed-context',
    '/system-design/search-engine.html': 'search-platform.html#engine',
    '/system-design/search-suggest.html': 'search-platform.html#suggest',
    '/system-design/video-streaming.html': 'media-platform.html#vod',
    '/system-design/live-streaming.html': 'media-platform.html#live',
    '/ai/llm-overview.html': 'training-alignment.html#llm-overview',
    '/ai/training-pipeline.html': 'training-alignment.html#training-pipeline',
    '/ai/fine-tuning.html': 'training-alignment.html#fine-tuning',
    '/ai/rlhf.html': 'training-alignment.html#rlhf',
    '/ai/llm-serving.html': 'inference-serving.html#llm-serving',
    '/ai/mixture-of-experts.html': 'inference-serving.html#mixture-of-experts',
    '/ai/inference-optimization.html': 'inference-serving.html#inference-optimization',
    '/ai/speculative-decoding.html': 'inference-serving.html#speculative-decoding',
    '/ai/multimodal.html': 'multimodal-generation.html#multimodal',
    '/ai/diffusion.html': 'multimodal-generation.html#diffusion',
    '/algo/binary-search-tree.html': 'search-trees.html#binary-search-tree',
    '/algo/avl-tree.html': 'search-trees.html#avl-tree',
    '/algo/red-black-tree.html': 'search-trees.html#red-black-tree',
    '/algo/b-tree.html': 'search-trees.html#b-tree',
    '/algo/dijkstra.html': 'shortest-paths.html#dijkstra',
    '/algo/bellman-ford.html': 'shortest-paths.html#bellman-ford',
    '/algo/floyd-warshall.html': 'shortest-paths.html#floyd-warshall',
    '/algo/kruskal.html': 'minimum-spanning-trees.html#kruskal',
    '/algo/prim.html': 'minimum-spanning-trees.html#prim',
    '/algo/knapsack.html': 'dynamic-programming.html#knapsack',
    '/algo/lcs.html': 'dynamic-programming.html#lcs',
    '/algo/edit-distance.html': 'dynamic-programming.html#edit-distance',
    '/algo/lis.html': 'dynamic-programming.html#lis',
    '/algo/interval-dp.html': 'dynamic-programming.html#interval-dp',
    '/distributed/cap-theorem.html': 'consistency-tradeoffs.html#cap',
    '/distributed/base.html': 'consistency-tradeoffs.html#base',
    '/distributed/vector-clock.html': 'conflict-convergence.html#vector-clock',
    '/distributed/crdt.html': 'conflict-convergence.html#crdt',
    '/algo/greedy.html': 'problem-solving-strategies.html#greedy',
    '/algo/backtracking.html': 'problem-solving-strategies.html#backtracking',
    '/algo/divide-conquer.html': 'sorting.html#divide-conquer',
    '/algo/bit-manipulation.html': '../cs/number-computing.html#bit-manipulation',
    '/cs/number.html': 'number-computing.html#number-representation'
  };
  const consolidatedEntry = Object.entries(consolidatedPages).find(function (entry) {
    return window.location.pathname.endsWith(entry[0]);
  });
  if (!embeddedDemo && consolidatedEntry) {
    window.location.replace(consolidatedEntry[1]);
    return;
  }
  if (embeddedDemo) {
    d.documentElement.classList.add('sn-demo-embed');
    const embedStyle = d.createElement('style');
    embedStyle.textContent = 'body{padding-top:0!important}.back-btn,.back-row,.page-back,.sn-hide-local-back{display:none!important}';
    d.head.appendChild(embedStyle);
    return;
  }

  const H = 44;
  const RKEY = 'recentPages_v2';
  const MODULE_RE = '(algo|db|kafka|redis|linux|network|cs|golang|distributed|ai|system-design|cloud-native|observability|security|testing)';
  const MODULE_PATH_RE = new RegExp('/' + MODULE_RE + '/');
  const HOME = MODULE_PATH_RE.test(window.location.pathname) ? '../index.html' : 'index.html';
  const ROOT = HOME.replace(/index\.html$/, '');

  // ── Inject body padding IMMEDIATELY (sync, before body renders) ──
  // This prevents the layout-shift flash
  const padStyle = d.createElement('style');
  padStyle.id = '__snavPad';
  padStyle.textContent = 'body{padding-top:var(--snav-h,' + H + 'px)!important;box-sizing:border-box!important;}';
  d.head.appendChild(padStyle);

  if (!d.getElementById('__siteMobileCss')) {
    const mobile = d.createElement('link');
    mobile.id = '__siteMobileCss';
    mobile.rel = 'stylesheet';
    mobile.href = ROOT + 'mobile.css';
    d.head.appendChild(mobile);
  }

  function loadR() {
    try { return JSON.parse(localStorage.getItem(RKEY) || '[]'); } catch (e) { return []; }
  }
  function saveR(a) {
    try { localStorage.setItem(RKEY, JSON.stringify(a)); } catch (e) {}
  }

  function siteRoot() {
    var match = window.location.pathname.match(new RegExp('^(.*)/(?:' + MODULE_RE + ')(?:/|$)'));
    if (match) return match[1] || '';
    var base = window.location.pathname.replace(/\/[^/]*$/, '');
    return base === '/' ? '' : base;
  }

  function normalizeHref(href) {
    if (!href || href.startsWith('#')) return '';
    if (new RegExp('^' + MODULE_RE + '/').test(href)) {
      return siteRoot() + '/' + href;
    }

    try {
      var url = new URL(href, window.location.href);
      if (url.protocol === 'file:') return url.href;
      if (url.origin === window.location.origin) return url.pathname + url.search + url.hash;
      return url.href;
    } catch (e) {
      return href;
    }
  }

  // ── Nav CSS ──
  if (!d.getElementById('__snavCss')) {
    const link = d.createElement('link');
    link.id = '__snavCss';
    link.rel = 'stylesheet';
    link.href = ROOT + 'nav.css';
    d.head.appendChild(link);
  }

  // ── Nav HTML ──
  const nav = d.createElement('div');
  nav.id = '__snav';
  nav.className = isHomePage() ? 'sn-home' : 'sn-subpage';
  nav.innerHTML =
    '<a href="' + HOME + '" class="sn-logo"><span class="sn-title">码海拾贝</span><span class="sn-motto">代码有迹可循，算法见微知著</span></a>' +
    '<div class="sn-crumbs" id="snCrumbs"></div>' +
    '<div class="sn-uw">' +
      '<button class="sn-btn" id="snBtn"><span>👤</span><span>游客</span><span class="sn-chev" id="snChev">▾</span></button>' +
      '<div class="sn-panel" id="snPanel">' +
        '<div class="sn-ph"><span>最近访问</span><button class="sn-pc" id="snClear">清除</button></div>' +
        '<div class="sn-list" id="snList"></div>' +
      '</div>' +
    '</div>';

  function renderList() {
    const items = loadR();
    const list = d.getElementById('snList');
    list.textContent = '';
    if (!items.length) {
      const empty = d.createElement('div');
      empty.className = 'sn-empty';
      empty.textContent = '暂无记录，浏览页面后自动保存';
      list.appendChild(empty);
      return;
    }
    const cc = { '算法': '#38bdf8', '数据库': '#fbbf24', 'Kafka': '#ff6b35', 'Redis': '#ef4444', 'Linux': '#6ee7b7', '网络': '#10b981', '组成原理': '#a78bfa', 'Golang': '#00add8', '分布式': '#c084fc', 'AI 系统': '#8b5cf6', '系统设计': '#f59e0b', '概念': '#c084fc', '测试工程': '#4ade80' };
    items.forEach(function (r) {
      const item = d.createElement('a');
      item.className = 'sn-item';
      item.href = normalizeHref(r.href) || '#';

      const icon = d.createElement('span');
      icon.className = 'sn-ico';
      icon.textContent = r.icon || '📄';

      const name = d.createElement('span');
      name.className = 'sn-name';
      name.textContent = r.name || '未命名页面';

      const cat = d.createElement('span');
      cat.className = 'sn-cat';
      cat.style.color = cc[r.cat] || '#64748b';
      cat.textContent = r.cat || '';

      item.appendChild(icon);
      item.appendChild(name);
      item.appendChild(cat);
      list.appendChild(item);
    });
  }

  function toggle() {
    const p = d.getElementById('snPanel'), c = d.getElementById('snChev');
    const open = p.classList.toggle('open');
    c.classList.toggle('open', open);
    if (open) renderList();
  }

  function init() {
    d.body.insertBefore(nav, d.body.firstChild);
    applyBodyClasses();
    renderBreadcrumbs();
    applySourceBackLinks();
    hideLocalBackLinks();
    syncNavHeight();
    scrollHashIntoView();
    ensureAutoConceptPanel();
    loadKnowledgePanel();
    d.getElementById('snBtn').addEventListener('click', toggle);
    d.getElementById('snClear').addEventListener('click', function () { saveR([]); renderList(); });
    d.addEventListener('click', function (e) {
      if (!e.target.closest('.sn-uw')) {
        const p = d.getElementById('snPanel'), c = d.getElementById('snChev');
        if (p) { p.classList.remove('open'); c.classList.remove('open'); }
      }
    });
    autoTrackCurrentPage();
  }

  function loadKnowledgePanel() {
    if (isHomePage() || isModuleIndexPage() || /\/graph\.html$/.test(window.location.pathname)) return;
    loadScript(ROOT + 'knowledge-data.js', function () {
      loadScript(ROOT + 'page-blocks.js', function () {
        loadScript(ROOT + 'knowledge-panel.js', function () {
          loadScript(ROOT + 'page-framework.js');
        });
      });
    });
  }

  function loadScript(src, done) {
    var existing = Array.from(d.scripts).find(function (script) {
      return script.src && script.src.split('?')[0].endsWith('/' + src.replace(/^\.\//, ''));
    });
    if (existing) {
      if (done) {
        if (existing.dataset.loaded === 'true' || existing.readyState === 'complete') done();
        else existing.addEventListener('load', done, { once: true });
      }
      return;
    }
    var script = d.createElement('script');
    script.src = src;
    script.addEventListener('load', function () {
      script.dataset.loaded = 'true';
      if (done) done();
    }, { once: true });
    d.head.appendChild(script);
  }

  function applyBodyClasses() {
    d.body.classList.toggle('sn-home-body', isHomePage());
    d.body.classList.toggle('sn-subpage-body', !isHomePage());
    d.body.classList.toggle('sn-module-index-body', isModuleIndexPage());
    d.body.classList.toggle('sn-detail-body', !isHomePage() && !isModuleIndexPage() && !/\/graph\.html$/.test(window.location.pathname));
    d.body.classList.toggle('sn-graph-body', /\/graph\.html$/.test(window.location.pathname));
    refreshFullscreenLabClass();
  }

  function refreshFullscreenLabClass() {
    var main = d.querySelector('body > .main');
    var hasViz = main && Array.from(main.children).some(function (child) {
      return child.classList.contains('viz-panel');
    });
    var hasCode = main && Array.from(main.children).some(function (child) {
      return child.classList.contains('code-panel');
    });
    var isFullscreenLab = Boolean(main && hasViz && hasCode && d.querySelector('body > .controls'));
    d.body.classList.toggle('sn-fullscreen-lab', isFullscreenLab);
    refreshReadingPageClass();
  }

  function refreshReadingPageClass() {
    var explicitShell = d.querySelector('.page-wrap .main-content');
    var prose = d.querySelector('main.prose, article.prose, .article-content');
    var article = d.querySelector('main > article');
    var articleHeadings = article ? article.querySelectorAll('h2, h3').length : 0;
    var hasArticleStructure = Boolean(explicitShell || prose || (article && articleHeadings >= 3));
    var hasProtocolOrLabLayout = Boolean(d.querySelector('.hero, .lab, .viz-panel, .code-panel'));
    var isReadingPage = Boolean(
      d.body.classList.contains('sn-detail-body') &&
      !d.body.classList.contains('sn-fullscreen-lab') &&
      hasArticleStructure &&
      !hasProtocolOrLabLayout
    );
    d.body.classList.toggle('sn-reading-page', isReadingPage);
  }

  function syncNavHeight() {
    function setHeight() {
      var h = nav.offsetHeight || H;
      d.documentElement.style.setProperty('--snav-h', h + 'px');
    }
    setHeight();
    if (window.ResizeObserver) {
      new ResizeObserver(setHeight).observe(nav);
    } else {
      window.addEventListener('resize', setHeight);
    }
  }

  function scrollHashIntoView() {
    if (!window.location.hash) return;
    var id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    var target = d.getElementById(id);
    if (!target) return;
    setTimeout(function () {
      var h = nav.offsetHeight || H;
      var top = target.getBoundingClientRect().top + window.pageYOffset - h - 12;
      window.scrollTo({ top: Math.max(0, top), behavior: 'auto' });
    }, 80);
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function (ch) {
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch];
    });
  }

  function ensureAutoConceptPanel() {
    setTimeout(function () {
      if (!d.body.classList.contains('sn-detail-body')) return;
      if (d.getElementById('__concept') || d.getElementById('__autoConcept')) return;
      var panel = buildAutoConceptPanel();
      var main = d.querySelector('.main');
      if (main && main.querySelector('.viz-panel') && main.querySelector('.code-panel')) {
        main.insertBefore(panel, main.firstChild);
        refreshFullscreenLabClass();
        return;
      }
      if (!adaptLegacyFlex(panel) && !adaptLegacyGrid(panel) && !adaptLegacyTopo(panel)) {
        adaptLegacyStacked(panel);
      }
      refreshFullscreenLabClass();
    }, 120);
    setTimeout(moveMiddleTextToLeft, 180);
    setTimeout(refreshFullscreenLabClass, 200);
  }

  function buildAutoConceptPanel() {
    var title = currentTitle();
    var panel = d.createElement('aside');
    panel.id = '__autoConcept';
    panel.className = 'sn-auto-concept';
    var safeTitle = escapeHtml(title);
    panel.innerHTML =
      '<div class="sn-auto-concept-h">核心概念</div>' +
      '<div class="sn-auto-card"><strong>' + safeTitle + '</strong><span>左侧用于理解概念与关键不变量，中间动画展示状态变化，右侧代码对应具体实现。</span></div>' +
      '<div class="sn-auto-card"><strong>动画阅读</strong><span>点击播放或逐步前进，先看图示中的状态变化，再对照右侧高亮代码。</span></div>' +
      '<div class="sn-auto-card"><strong>代码对应</strong><span>高亮行表示当前步骤涉及的核心逻辑，适合把抽象过程落到实现细节上。</span></div>';
    return panel;
  }

  function adaptLegacyGrid(panel) {
    var layout = d.querySelector('.layout');
    if (!layout || !layout.querySelector('.code-block')) return false;
    layout.insertBefore(panel, layout.firstChild);
    d.body.classList.add('sn-legacy-grid');
    return true;
  }

  function adaptLegacyFlex(panel) {
    var layout = d.querySelector('.layout');
    if (!layout || !layout.querySelector('.sidebar') || !layout.querySelector('.main')) return false;
    layout.insertBefore(panel, layout.firstChild);
    d.body.classList.add('sn-legacy-flex');
    return true;
  }

  function adaptLegacyTopo(panel) {
    var main = d.querySelector('.main');
    if (!main || !main.querySelector('.center') || !main.querySelector('.code-panel')) return false;
    main.insertBefore(panel, main.firstChild);
    main.appendChild(main.querySelector('.code-panel'));
    d.body.classList.add('sn-legacy-topo');
    return true;
  }

  function adaptLegacyStacked(panel) {
    var code = d.querySelector('.code-section');
    if (!code || d.querySelector('.main')) return false;
    var first = d.querySelector('.op-bar, .svg-wrap');
    if (!first) return false;
    var main = d.createElement('div');
    main.className = 'main';
    var viz = d.createElement('div');
    viz.className = 'sn-legacy-viz';
    var codeWrap = d.createElement('div');
    codeWrap.className = 'sn-legacy-code';
    first.parentNode.insertBefore(main, first);
    main.appendChild(panel);
    main.appendChild(viz);
    main.appendChild(codeWrap);
    var node = first;
    while (node && node !== code) {
      var next = node.nextSibling;
      viz.appendChild(node);
      node = next;
    }
    codeWrap.appendChild(code);
    d.body.classList.add('sn-legacy-wrapped');
    return true;
  }

  function moveMiddleTextToLeft() {
    if (!d.body.classList.contains('sn-detail-body')) return;
    var left = d.getElementById('__concept') || d.getElementById('__autoConcept') || d.querySelector('.steps-panel');
    if (!left) return;
    d.querySelectorAll('.viz-panel > .desc-box').forEach(function (desc) {
      if (desc.dataset.snMoved === '1') return;
      desc.dataset.snMoved = '1';
      desc.classList.add('sn-left-step-desc');
      left.appendChild(desc);
    });
  }

  function isHomePage() {
    var path = window.location.pathname;
    if (new RegExp('/' + MODULE_RE + '/index\\.html$').test(path)) return false;
    return path === '/' || /\/index\.html$/.test(path) || /\/blog\/?$/.test(path);
  }

  function moduleInfo() {
    var match = window.location.pathname.match(new RegExp('/' + MODULE_RE + '/'));
    var map = {
      algo: { label: '算法', href: 'index.html' },
      db: { label: '数据库', href: 'index.html' },
      kafka: { label: 'Kafka', href: 'index.html' },
      redis: { label: 'Redis', href: 'index.html' },
      linux: { label: 'Linux', href: 'index.html' },
      network: { label: '网络', href: 'index.html' },
      cs: { label: '组成原理', href: 'index.html' },
      golang: { label: 'Golang', href: 'index.html' },
      distributed: { label: '分布式', href: 'index.html' },
      ai: { label: 'AI 系统', href: 'index.html' },
      'system-design': { label: '系统设计', href: 'index.html' },
      'cloud-native': { label: '云原生', href: 'index.html' },
      observability: { label: '可观测性', href: 'index.html' },
      security: { label: '安全基础', href: 'index.html' },
      testing: { label: '测试工程', href: 'index.html' }
    };
    var moduleKey = match ? match[1] : d.documentElement.dataset.siteModule;
    if (!moduleKey || !map[moduleKey]) return null;
    return {
      label: map[moduleKey].label,
      href: match ? map[moduleKey].href : moduleKey + '/index.html'
    };
  }

  function isModuleIndexPage() {
    return new RegExp('/' + MODULE_RE + '/index\\.html$').test(window.location.pathname);
  }

  function graphHref() {
    return MODULE_PATH_RE.test(window.location.pathname) ? '../graph.html' : 'graph.html';
  }

  function currentTitle() {
    var title = (d.querySelector('nav h1, .nav-title, header h1') || {}).textContent || d.title.replace(/\s*[-|].*$/, '');
    return title.trim() || '当前页面';
  }

  function renderBreadcrumbs() {
    var box = d.getElementById('snCrumbs');
    if (!box) return;
    box.textContent = '';
    if (isHomePage()) return;

    function addLink(text, href) {
      var a = d.createElement('a');
      a.textContent = text;
      a.href = href;
      box.appendChild(a);
    }
    function addSep() {
      var sep = d.createElement('span');
      sep.className = 'sn-sep';
      sep.textContent = '/';
      box.appendChild(sep);
    }
    function addCurrent(text) {
      var cur = d.createElement('span');
      cur.className = 'sn-current';
      cur.textContent = text;
      box.appendChild(cur);
    }

    var params = new URLSearchParams(window.location.search);
    var fromGraph = params.get('from') === 'graph';
    var mod = moduleInfo();
    addLink('首页', HOME);
    if (fromGraph) {
      addSep();
      addLink('知识星图', graphHref());
    }
    if (mod && isModuleIndexPage()) {
      addSep();
      addCurrent(currentTitle());
      return;
    }
    if (mod) {
      addSep();
      addLink(mod.label, mod.href);
    } else if (/\/graph\.html$/.test(window.location.pathname)) {
      addSep();
      addCurrent('知识星图');
      return;
    }
    addSep();
    addCurrent(currentTitle());
  }

  function applySourceBackLinks() {
    var params = new URLSearchParams(window.location.search);
    if (params.get('from') !== 'graph') return;
    var href = graphHref();
    var backs = d.querySelectorAll('.back-btn, .page-back, nav a[href="index.html"], a[href="index.html"]');
    backs.forEach(function (a) {
      if (a.closest('#__snav')) return;
      var text = (a.textContent || '').trim();
      if (text.indexOf('返回') === -1) return;
      a.href = href;
      a.textContent = '← 返回星图';
    });
  }

  function hideLocalBackLinks() {
    if (isHomePage()) return;
    var backs = d.querySelectorAll('.back-btn, .page-back, nav a[href="index.html"], a[href="index.html"], .back');
    backs.forEach(function (a) {
      if (a.closest('#__snav')) return;
      var text = (a.textContent || '').trim();
      if (text.indexOf('返回') === -1) return;
      a.classList.add('sn-hide-local-back');
    });
  }

  function autoTrackCurrentPage() {
    var match = window.location.pathname.match(new RegExp('/' + MODULE_RE + '/([^/]+)\\.html$'));
    if (!match || match[2] === 'index') return;

    var href = normalizeHref(window.location.href);
    var alreadyTracked = loadR().some(function (r) { return normalizeHref(r.href) === href; });
    if (alreadyTracked) return;

    var meta = {
      algo: { cat: '算法', icon: '🔢' },
      db: { cat: '数据库', icon: '🗄️' },
      kafka: { cat: 'Kafka', icon: '📦' },
      redis: { cat: 'Redis', icon: '🔴' },
      linux: { cat: 'Linux', icon: '🐧' },
      network: { cat: '网络', icon: '🌐' },
      cs: { cat: '组成原理', icon: '🧠' },
      golang: { cat: 'Golang', icon: '🐹' },
      distributed: { cat: '分布式', icon: '📡' },
      ai: { cat: 'AI 系统', icon: '🤖' },
      'system-design': { cat: '系统设计', icon: '🏛️' },
      'cloud-native': { cat: '云原生', icon: '☁️' },
      observability: { cat: '可观测性', icon: '🔭' },
      security: { cat: '安全基础', icon: '🔐' },
      testing: { cat: '测试工程', icon: '🧪' }
    }[match[1]];
    var title = (d.querySelector('nav h1, .nav-title, header h1') || {}).textContent || d.title.replace(/\s*[-|].*$/, '');
    if (!window.NavTracker || !meta) return;
    window.NavTracker.track(title.trim(), href, meta.icon, meta.cat);
  }

  if (d.readyState === 'loading') {
    d.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.NavTracker = {
    track: function (name, href, icon, cat) {
      var normalizedHref = normalizeHref(href);
      if (!name || !normalizedHref) return;
      var items = loadR().filter(function (r) { return normalizeHref(r.href) !== normalizedHref; });
      items.unshift({ name: name, href: normalizedHref, icon: icon || '📄', cat: cat || '' });
      saveR(items.slice(0, 20));
    }
  };
})();
