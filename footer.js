// Shared footer — injected into algo/ and db/ hub & sub-pages
(function () {
  'use strict';
  const d = document;
  if (d.getElementById('__sfooter')) return;

  function isDetailPage() {
    var path = window.location.pathname;
    return /\/(algo|db|kafka|redis|linux|network|cs|golang|distributed|ai|system-design|cloud-native|observability|security|testing)\/(?!index\.html$)[^/]+\.html$/.test(path);
  }

  if (isDetailPage()) return;

  function friendLinksHref() {
    var inModule = /\/(algo|db|kafka|redis|linux|network|cs|golang|distributed|ai|system-design|cloud-native|observability|security|testing)\//.test(window.location.pathname);
    var onHome = !inModule && (window.location.hash === '#friend-links' || /\/index\.html$/.test(window.location.pathname) || window.location.pathname === '/' || /\/blog\/?$/.test(window.location.pathname));
    if (onHome) return '#friend-links';
    return (inModule ? '../' : '') + 'index.html#friend-links';
  }

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
.sf-links{display:flex;align-items:center;}
.sf-links a{color:#94a3b8;text-decoration:none;transition:color 0.15s;}
.sf-links a:hover{color:#38bdf8;}
@media(max-width:640px){
  #__sfooter{justify-content:center;text-align:center;}
  .sf-links{justify-content:center;}
}
`;
  d.head.appendChild(style);

  const footer = d.createElement('footer');
  footer.id = '__sfooter';
  footer.innerHTML =
    '<span class="sf-copy">© 2026 码海拾贝 · 纯静态 · Go · SVG</span>' +
    '<nav class="sf-links">' +
      '<a href="' + friendLinksHref() + '">友情链接</a>' +
    '</nav>';

  function init() {
    if (d.getElementById('__sfooter')) return;
    d.body.appendChild(footer);
  }

  if (d.readyState === 'loading') {
    d.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
