// Shared nav bar — load this in <head> for zero layout-shift
(function () {
  'use strict';
  const d = document;
  if (d.getElementById('__snav')) return;

  const H = 44;
  const RKEY = 'recentPages_v2';
  const MODULE_RE = '(algo|db|kafka|redis|linux|network|cs|golang|distributed|ai|system-design)';
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
  const style = d.createElement('style');
  style.textContent = `
#__snav{
  position:fixed;top:0;left:0;right:0;z-index:8000;
  height:${H}px;display:flex;align-items:center;justify-content:space-between;
  padding:0 18px;
  background:rgba(13,17,23,0.92);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
  border-bottom:1px solid rgba(255,255,255,0.07);
  font-family:'Segoe UI',system-ui,-apple-system,sans-serif;
}
.sn-logo{display:flex;flex-direction:column;gap:1px;text-decoration:none;}
.sn-logo .sn-title{background:linear-gradient(120deg,#38bdf8 0%,#c084fc 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-size:0.92rem;font-weight:700;letter-spacing:0.06em;white-space:nowrap;}
.sn-logo .sn-motto{font-size:0.58rem;color:#64748b;font-style:italic;letter-spacing:0.02em;align-self:flex-end;white-space:nowrap;}
.sn-crumbs{display:flex;align-items:center;gap:7px;min-width:0;flex:1;margin:0 18px;color:#64748b;font-size:0.78rem;white-space:nowrap;overflow:hidden;}
.sn-home .sn-crumbs{display:none;}
.sn-subpage .sn-logo{display:none;}
.sn-subpage .sn-crumbs{margin-left:0;}
.sn-hide-local-back{display:none!important;}
.sn-crumbs a{color:#94a3b8;text-decoration:none;overflow:hidden;text-overflow:ellipsis;}
.sn-crumbs a:hover{color:#e2e8f0;}
.sn-crumbs .sn-sep{color:#475569;}
.sn-crumbs .sn-current{color:#e2e8f0;overflow:hidden;text-overflow:ellipsis;}
.sn-uw{position:relative;}
.sn-btn{
  display:flex;align-items:center;gap:6px;padding:5px 11px;border-radius:7px;
  background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);
  color:#e2e8f0;cursor:pointer;font-size:0.82rem;font-family:inherit;transition:all 0.15s;
}
.sn-btn:hover{background:rgba(255,255,255,0.1);}
.sn-chev{color:#64748b;font-size:0.65rem;transition:transform 0.2s;display:inline-block;}
.sn-chev.open{transform:rotate(180deg);}
.sn-panel{
  position:absolute;top:calc(100% + 8px);right:0;width:280px;
  background:#1e293b;border:1px solid #334155;border-radius:12px;
  box-shadow:0 16px 40px rgba(0,0,0,0.6);display:none;overflow:hidden;z-index:8001;
}
.sn-panel.open{display:block;}
.sn-ph{
  display:flex;align-items:center;justify-content:space-between;
  padding:12px 14px 9px;border-bottom:1px solid rgba(255,255,255,0.05);
  font-size:0.78rem;font-weight:600;color:#94a3b8;
}
.sn-pc{background:none;border:none;cursor:pointer;font-size:0.7rem;color:#64748b;font-family:inherit;padding:0;transition:color 0.15s;}
.sn-pc:hover{color:#f87171;}
.sn-list{max-height:300px;overflow-y:auto;padding:5px 0;}
.sn-list::-webkit-scrollbar{width:3px;}
.sn-list::-webkit-scrollbar-thumb{background:#334155;border-radius:2px;}
.sn-empty{padding:20px;text-align:center;color:#64748b;font-size:0.78rem;}
.sn-item{display:flex;align-items:center;gap:9px;padding:8px 14px;text-decoration:none;color:#e2e8f0;font-size:0.82rem;transition:background 0.12s;}
.sn-item:hover{background:rgba(255,255,255,0.05);}
.sn-ico{font-size:0.9rem;flex-shrink:0;}
.sn-name{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.sn-cat{font-size:0.65rem;color:#64748b;flex-shrink:0;font-family:monospace;}
.sn-auto-concept{width:256px;min-width:256px;display:flex;flex-direction:column;border-right:1px solid rgba(255,255,255,.06);background:#151f30;overflow:auto;flex-shrink:0}
.sn-auto-concept-h{font-size:.68rem;font-weight:700;letter-spacing:.1em;color:#475569;text-transform:uppercase;padding:14px 14px 10px}
.sn-auto-card{padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.04)}
.sn-auto-card strong{display:block;color:#38bdf8;font-size:.8rem;margin-bottom:5px}
.sn-auto-card span{display:block;color:#64748b;font-size:.75rem;line-height:1.65}
.sn-left-step-desc{margin:0 14px 12px;border:1px solid rgba(255,255,255,.07);border-radius:10px;background:rgba(13,17,23,.42);padding:10px 12px;color:#94a3b8;font-size:.76rem;line-height:1.65}
.sn-left-step-desc .step-counter{display:block;margin:6px 0 0!important;color:#64748b;font-family:monospace;font-size:.72rem}
body.sn-detail-body .main,
body.sn-detail-body .layout,
body.sn-detail-body .viz-panel,
body.sn-detail-body .diagram-panel,
body.sn-detail-body .center,
body.sn-detail-body .code-panel{min-width:0!important}
body.sn-detail-body .sn-auto-concept,
body.sn-detail-body .steps-panel,
body.sn-detail-body .sidebar,
body.sn-detail-body .steps-area,
body.sn-detail-body .sn-left-step-desc{overflow-x:hidden!important;max-width:100%}
body.sn-detail-body .sn-auto-card,
body.sn-detail-body .sn-auto-card span,
body.sn-detail-body .step-card,
body.sn-detail-body .step-card span,
body.sn-detail-body .topic-sum,
body.sn-detail-body .topic-sum p{overflow-wrap:anywhere;word-break:break-word}
body.sn-detail-body .viz-area,
body.sn-detail-body .diagram-area,
body.sn-detail-body .diagram,
body.sn-detail-body .svg-wrap,
body.sn-detail-body .viz-canvas-wrap,
body.sn-detail-body .viz-demo,
body.sn-detail-body .flow,
body.sn-detail-body .table-wrap{overflow:hidden!important;max-width:100%}
body.sn-detail-body .diagram .arch-svg{min-width:0!important;max-width:100%!important;height:auto!important}
body.sn-detail-body .flow{flex-wrap:wrap}
body.sn-detail-body .flow-node{min-width:min(118px,100%)}
body.sn-detail-body .code-panel,
body.sn-detail-body .code-body,
body.sn-detail-body .detail-body,
body.sn-detail-body .code-block,
body.sn-detail-body .code-scroll,
body.sn-detail-body pre{overflow-x:hidden!important;max-width:100%}
body.sn-detail-body .code-line{min-width:0;white-space:normal}
body.sn-detail-body .lc,
body.sn-detail-body code,
body.sn-detail-body pre,
body.sn-detail-body .code-block,
body.sn-detail-body .code-content pre,
body.sn-detail-body .sql-bar{white-space:pre-wrap!important;overflow-wrap:anywhere;word-break:break-word}
body.sn-detail-body .lc{min-width:0}
body.sn-legacy-grid .layout{display:grid!important;grid-template-columns:256px minmax(0,1fr) 380px!important;gap:20px!important;align-items:stretch}
body.sn-legacy-flex .layout{display:flex!important;gap:0!important;overflow:hidden}
body.sn-legacy-flex .layout>.main{order:2;flex:1;min-width:0}
body.sn-legacy-flex .layout>.sidebar{order:3;width:320px;min-width:320px;border-left:1px solid rgba(255,255,255,.06);border-right:none}
body.sn-legacy-topo .main>.sn-auto-concept{order:1}
body.sn-legacy-topo .main>.center{order:2;flex:1}
body.sn-legacy-topo .main>.code-panel{order:3;width:360px;border-left:1px solid var(--border,#334155);border-right:none}
body.sn-legacy-wrapped .main{display:flex!important;gap:0!important;overflow:hidden;flex:1}
body.sn-legacy-wrapped .sn-legacy-viz{flex:1;min-width:0;overflow:auto;padding-right:16px}
body.sn-legacy-wrapped .sn-legacy-code{width:390px;min-width:390px;overflow:auto;border-left:1px solid rgba(255,255,255,.06);padding-left:16px}
@media(max-width:760px){
  #__snav{height:auto;min-height:${H}px;flex-wrap:nowrap;padding:5px 12px;gap:8px}
  .sn-logo .sn-motto{display:none}
  .sn-logo .sn-title{font-size:.86rem}
  .sn-uw{margin-left:auto;flex-shrink:0}
  .sn-panel{right:0}
  .sn-home .sn-logo{display:flex;min-width:0}
  .sn-home .sn-crumbs{display:none}
  .sn-subpage .sn-crumbs{display:flex;order:0;width:auto;flex:1 1 auto;flex-basis:auto;margin:0;font-size:.72rem;min-width:0}
  .sn-subpage .sn-current{min-width:0}
  .sn-auto-concept{width:100%!important;min-width:0!important;max-height:120px;border-right:none;border-bottom:1px solid rgba(255,255,255,.06)}
  .sn-auto-concept-h{padding:10px 14px 4px}
  .sn-auto-card{padding:7px 14px}
  body.sn-legacy-grid .layout,
  body.sn-legacy-flex .layout,
  body.sn-legacy-wrapped .main{display:flex!important;flex-direction:column!important;overflow:visible!important}
  body.sn-legacy-flex .layout>.sidebar,
  body.sn-legacy-topo .main>.code-panel,
  body.sn-legacy-wrapped .sn-legacy-code{order:3;width:100%!important;min-width:0!important;border-left:none!important;padding-left:0!important}
  body.sn-legacy-wrapped .sn-legacy-viz{padding-right:0!important;overflow:visible!important}
}
`;
  d.head.appendChild(style);

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
    const cc = { '算法': '#38bdf8', '数据库': '#fbbf24', 'Kafka': '#ff6b35', 'Redis': '#ef4444', 'Linux': '#6ee7b7', '网络': '#10b981', '组成原理': '#a78bfa', 'Golang': '#00add8', '分布式': '#c084fc', 'AI 系统': '#8b5cf6', '系统设计': '#f59e0b', '概念': '#c084fc' };
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

  function applyBodyClasses() {
    d.body.classList.toggle('sn-home-body', isHomePage());
    d.body.classList.toggle('sn-subpage-body', !isHomePage());
    d.body.classList.toggle('sn-module-index-body', isModuleIndexPage());
    d.body.classList.toggle('sn-detail-body', !isHomePage() && !isModuleIndexPage() && !/\/graph\.html$/.test(window.location.pathname));
    d.body.classList.toggle('sn-graph-body', /\/graph\.html$/.test(window.location.pathname));
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
        return;
      }
      if (adaptLegacyFlex(panel)) return;
      if (adaptLegacyGrid(panel)) return;
      if (adaptLegacyTopo(panel)) return;
      adaptLegacyStacked(panel);
    }, 120);
    setTimeout(moveMiddleTextToLeft, 180);
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
      'system-design': { label: '系统设计', href: 'index.html' }
    };
    return match ? map[match[1]] : null;
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
      distributed: { cat: '分布式', icon: '🌐' },
      ai: { cat: 'AI 系统', icon: '🤖' },
      'system-design': { cat: '系统设计', icon: '🏛️' }
    }[match[1]];
    var title = (d.querySelector('nav h1, .nav-title, header h1') || {}).textContent || d.title.replace(/\s*[-|].*$/, '');
    if (!window.NavTracker) return;
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
