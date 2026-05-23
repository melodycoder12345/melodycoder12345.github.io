// Shared nav bar — load this in <head> for zero layout-shift
(function () {
  'use strict';
  const d = document;
  if (d.getElementById('__snav')) return;

  const H = 44;
  const RKEY = 'recentPages_v2';

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
.sn-logo{display:flex;align-items:center;gap:8px;text-decoration:none;font-size:0.92rem;font-weight:700;letter-spacing:0.04em;}
.sn-logo .sn-dot{width:7px;height:7px;border-radius:50%;background:linear-gradient(135deg,#38bdf8,#c084fc);flex-shrink:0;}
.sn-logo .sn-title{background:linear-gradient(120deg,#38bdf8 0%,#c084fc 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.sn-motto{font-size:0.68rem;color:#475569;font-style:italic;letter-spacing:0.05em;flex:1;text-align:center;pointer-events:none;}
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
`;
  d.head.appendChild(style);

  // ── Nav HTML ──
  const nav = d.createElement('div');
  nav.id = '__snav';
  nav.innerHTML =
    '<a href="../index.html" class="sn-logo"><span class="sn-dot"></span><span class="sn-title">码海拾贝</span></a>' +
    '<span class="sn-motto">Talk is cheap, show me the code.</span>' +
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
    if (!items.length) { list.innerHTML = '<div class="sn-empty">暂无记录<br>浏览页面后自动保存</div>'; return; }
    const cc = { '算法': '#38bdf8', '数据库': '#fbbf24' };
    list.innerHTML = items.map(function (r) {
      return '<a href="' + r.href + '" class="sn-item">' +
        '<span class="sn-ico">' + (r.icon || '📄') + '</span>' +
        '<span class="sn-name">' + r.name + '</span>' +
        '<span class="sn-cat" style="color:' + (cc[r.cat] || '#64748b') + '">' + (r.cat || '') + '</span>' +
        '</a>';
    }).join('');
  }

  function toggle() {
    const p = d.getElementById('snPanel'), c = d.getElementById('snChev');
    const open = p.classList.toggle('open');
    c.classList.toggle('open', open);
    if (open) renderList();
  }

  function init() {
    d.body.insertBefore(nav, d.body.firstChild);
    d.getElementById('snBtn').addEventListener('click', toggle);
    d.getElementById('snClear').addEventListener('click', function () { saveR([]); renderList(); });
    d.addEventListener('click', function (e) {
      if (!e.target.closest('.sn-uw')) {
        const p = d.getElementById('snPanel'), c = d.getElementById('snChev');
        if (p) { p.classList.remove('open'); c.classList.remove('open'); }
      }
    });
  }

  if (d.readyState === 'loading') {
    d.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
