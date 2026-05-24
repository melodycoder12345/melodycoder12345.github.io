// Shared nav bar — load this in <head> for zero layout-shift
(function () {
  'use strict';
  const d = document;
  if (d.getElementById('__snav')) return;

  const H = 44;
  const RKEY = 'recentPages_v2';
  const HOME = /\/(algo|db|kafka|redis|linux|network)\//.test(window.location.pathname) ? '../index.html' : 'index.html';

  // ── Inject body padding IMMEDIATELY (sync, before body renders) ──
  // This prevents the layout-shift flash
  const padStyle = d.createElement('style');
  padStyle.id = '__snavPad';
  padStyle.textContent = 'body{padding-top:' + H + 'px!important;box-sizing:border-box!important;}';
  d.head.appendChild(padStyle);

  function loadR() {
    try { return JSON.parse(localStorage.getItem(RKEY) || '[]'); } catch (e) { return []; }
  }
  function saveR(a) {
    try { localStorage.setItem(RKEY, JSON.stringify(a)); } catch (e) {}
  }

  function siteRoot() {
    var match = window.location.pathname.match(/^(.*)\/(?:algo|db|kafka|redis|linux|network)(?:\/|$)/);
    if (match) return match[1] || '';
    var base = window.location.pathname.replace(/\/[^/]*$/, '');
    return base === '/' ? '' : base;
  }

  function normalizeHref(href) {
    if (!href || href.startsWith('#')) return '';
    if (/^(algo|db|kafka|redis|linux|network)\//.test(href)) {
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
@media(max-width:760px){.sn-logo .sn-motto{display:none}.sn-crumbs{order:3;width:100%;flex-basis:100%;margin:0;font-size:.72rem}#__snav{height:auto;min-height:${H}px;flex-wrap:wrap;padding:5px 12px}.sn-panel{right:0}.sn-logo .sn-title{font-size:.86rem}}
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
    const cc = { '算法': '#38bdf8', '数据库': '#fbbf24', 'Kafka': '#ff6b35', 'Redis': '#ef4444', 'Linux': '#f7c948', '网络': '#2dd4bf' };
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
    renderBreadcrumbs();
    applySourceBackLinks();
    hideLocalBackLinks();
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

  function isHomePage() {
    return /\/index\.html$/.test(window.location.pathname) && !/\/(algo|db|kafka|redis|linux|network)\/index\.html$/.test(window.location.pathname);
  }

  function moduleInfo() {
    var match = window.location.pathname.match(/\/(algo|db|kafka|redis|linux|network)\//);
    var map = {
      algo: { label: '算法', href: 'index.html' },
      db: { label: '数据库', href: 'index.html' },
      kafka: { label: 'Kafka', href: 'index.html' },
      redis: { label: 'Redis', href: 'index.html' },
      linux: { label: 'Linux', href: 'index.html' },
      network: { label: '网络', href: 'index.html' }
    };
    return match ? map[match[1]] : null;
  }

  function isModuleIndexPage() {
    return /\/(algo|db|kafka|redis|linux|network)\/index\.html$/.test(window.location.pathname);
  }

  function graphHref() {
    return /\/(algo|db|kafka|redis|linux|network)\//.test(window.location.pathname) ? '../graph.html' : 'graph.html';
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
    var match = window.location.pathname.match(/\/(algo|db|kafka|redis|linux|network)\/([^/]+)\.html$/);
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
      network: { cat: '网络', icon: '🌐' }
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
