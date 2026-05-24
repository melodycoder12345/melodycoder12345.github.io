// Shared collapsible concept panel — injected into non-algo detail pages
// Each page defines: window.PAGE_CONCEPTS = [{ title, body, tag? }, ...]
(function () {
  'use strict';

  const EXPANDED_W = 256;
  const COLLAPSED_W = 32;

  const style = document.createElement('style');
  style.textContent = `
#__concept{
  width:${EXPANDED_W}px;min-width:${EXPANDED_W}px;
  display:flex;flex-direction:column;
  border-right:1px solid rgba(255,255,255,0.06);
  background:#151f30;
  transition:width 0.25s ease,min-width 0.25s ease;
  overflow:hidden;position:relative;flex-shrink:0;
}
#__concept.collapsed{width:${COLLAPSED_W}px;min-width:${COLLAPSED_W}px;}
#__concept-toggle{
  position:absolute;top:10px;right:8px;
  width:20px;height:20px;border-radius:4px;
  background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);
  color:#64748b;cursor:pointer;font-size:0.7rem;
  display:flex;align-items:center;justify-content:center;
  transition:all 0.15s;z-index:10;flex-shrink:0;
  padding:0;
}
#__concept-toggle:hover{background:rgba(255,255,255,0.12);color:#e2e8f0;}
#__concept-inner{
  flex:1;overflow-y:auto;overflow-x:hidden;
  padding:12px 0 16px;
  display:flex;flex-direction:column;
  white-space:nowrap;
  transition:opacity 0.2s;
}
#__concept.collapsed #__concept-inner{opacity:0;pointer-events:none;}
#__concept-inner::-webkit-scrollbar{width:3px;}
#__concept-inner::-webkit-scrollbar-thumb{background:#334155;border-radius:2px;}
#__concept-hdr{
  font-size:0.68rem;font-weight:700;letter-spacing:0.1em;
  color:#475569;text-transform:uppercase;
  padding:0 14px 10px;
}
.cp-card{
  padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.04);
  cursor:default;
}
.cp-card:last-child{border-bottom:none;}
.cp-title{
  font-size:0.8rem;font-weight:600;
  margin-bottom:5px;line-height:1.3;
  display:flex;align-items:center;gap:6px;
}
.cp-tag{
  font-size:0.6rem;padding:1px 5px;border-radius:3px;
  background:rgba(255,255,255,0.08);color:#64748b;
  font-family:monospace;font-weight:400;flex-shrink:0;
}
.cp-body{
  font-size:0.75rem;color:#64748b;line-height:1.65;
  white-space:pre-wrap;word-break:break-word;
}
#__concept.collapsed #__concept-hdr,
#__concept.collapsed .cp-card{display:none;}
#__concept-pill{
  position:absolute;bottom:0;left:0;right:0;
  display:none;flex-direction:column;align-items:center;
  justify-content:center;padding:8px 0;gap:6px;
  color:#334155;font-size:0.6rem;letter-spacing:0.05em;
}
#__concept.collapsed #__concept-pill{display:flex;}
#__concept-pill span{writing-mode:vertical-rl;text-orientation:mixed;color:#334155;font-size:0.62rem;}
@media(max-width:768px){
  #__concept{
    width:100%!important;min-width:0!important;max-height:220px;
    border-right:none;border-bottom:1px solid rgba(255,255,255,0.06);
    transition:max-height 0.25s ease;
  }
  #__concept.collapsed{width:100%!important;min-width:0!important;max-height:36px;}
  #__concept-toggle{top:8px;right:12px;}
  #__concept-inner{max-height:220px;padding-right:40px;}
  #__concept.collapsed #__concept-pill{
    top:0;bottom:auto;height:36px;display:flex;flex-direction:row;
    justify-content:flex-start;padding:0 14px;
  }
  #__concept-pill span{writing-mode:horizontal-tb;text-orientation:mixed;}
}
`;
  document.head.appendChild(style);

  var expanded = !(window.matchMedia && window.matchMedia('(max-width: 768px)').matches);

  function build() {
    if (!window.PAGE_CONCEPTS || !window.PAGE_CONCEPTS.length) return;
    var main = document.querySelector('.main');
    if (!main) return;

    var panel = document.createElement('div');
    panel.id = '__concept';
    panel.classList.toggle('collapsed', !expanded);

    var toggle = document.createElement('button');
    toggle.id = '__concept-toggle';
    toggle.title = '折叠/展开概念说明';
    toggle.innerHTML = expanded ? '◀' : '▶';
    toggle.addEventListener('click', function () {
      expanded = !expanded;
      panel.classList.toggle('collapsed', !expanded);
      toggle.innerHTML = expanded ? '◀' : '▶';
    });

    var inner = document.createElement('div');
    inner.id = '__concept-inner';

    var hdr = document.createElement('div');
    hdr.id = '__concept-hdr';
    hdr.textContent = '核心概念';
    inner.appendChild(hdr);

    (window.PAGE_CONCEPTS || []).forEach(function (c) {
      var card = document.createElement('div');
      card.className = 'cp-card';

      var titleEl = document.createElement('div');
      titleEl.className = 'cp-title';

      // detect accent color from CSS var
      var accentVar = getComputedStyle(document.documentElement)
        .getPropertyValue('--accent') ||
        getComputedStyle(document.documentElement)
        .getPropertyValue('--kafka') ||
        getComputedStyle(document.documentElement)
        .getPropertyValue('--redis') ||
        getComputedStyle(document.documentElement)
        .getPropertyValue('--linux') ||
        getComputedStyle(document.documentElement)
        .getPropertyValue('--teal') || '#38bdf8';
      accentVar = accentVar.trim();

      var titleText = document.createElement('span');
      titleText.style.color = accentVar;
      titleText.textContent = c.title;
      titleEl.appendChild(titleText);
      if (c.tag) {
        var tagEl = document.createElement('span');
        tagEl.className = 'cp-tag';
        tagEl.textContent = c.tag;
        titleEl.appendChild(tagEl);
      }

      var bodyEl = document.createElement('div');
      bodyEl.className = 'cp-body';
      bodyEl.textContent = c.body;

      card.appendChild(titleEl);
      card.appendChild(bodyEl);
      inner.appendChild(card);
    });

    var pill = document.createElement('div');
    pill.id = '__concept-pill';
    pill.innerHTML = '<span>概念</span>';

    panel.appendChild(toggle);
    panel.appendChild(inner);
    panel.appendChild(pill);
    main.insertBefore(panel, main.firstChild);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
