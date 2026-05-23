// Shared footer — injected into algo/ and db/ hub & sub-pages
(function () {
  'use strict';
  const d = document;
  if (d.getElementById('__sfooter')) return;

  const style = d.createElement('style');
  style.textContent = `
#__sfooter{
  border-top:1px solid rgba(255,255,255,0.06);
  padding:18px 24px;display:flex;align-items:center;justify-content:space-between;
  flex-wrap:wrap;gap:10px;color:#64748b;font-size:0.78rem;
  font-family:'Segoe UI',system-ui,-apple-system,sans-serif;
  margin-top:auto;
}
.sf-copy{color:#64748b;}
.sf-links{display:flex;align-items:center;gap:16px;}
.sf-links a{color:#94a3b8;text-decoration:none;transition:color 0.15s;}
.sf-links a:hover{color:#38bdf8;}
.sf-sep{color:#334155;}
`;
  d.head.appendChild(style);

  const footer = d.createElement('footer');
  footer.id = '__sfooter';
  footer.innerHTML =
    '<span class="sf-copy">© 2026 hudan\'s notes · 纯静态 · Go · SVG</span>' +
    '<nav class="sf-links">' +
      '<a href="../index.html">主页</a>' +
      '<span class="sf-sep">·</span>' +
      '<a href="../algo/index.html">算法可视化</a>' +
      '<span class="sf-sep">·</span>' +
      '<a href="../db/index.html">数据库原理</a>' +
    '</nav>';

  function init() {
    // Remove any existing <footer> to avoid duplicates
    const existing = d.querySelector('footer');
    if (existing) existing.remove();
    d.body.appendChild(footer);
  }

  if (d.readyState === 'loading') {
    d.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
