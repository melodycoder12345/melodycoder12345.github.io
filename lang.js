// Shared language switcher for algo pages
// Each page defines: LANG_PLAIN = { go: '...', js: '...', py: '...' }
// And calls: initLangSwitcher()

(function () {
  'use strict';

  // ── CSS ──
  const style = document.createElement('style');
  style.textContent = `
.lang-switcher{display:flex;gap:4px;align-items:center;}
.lang-btn{
  padding:3px 10px;border-radius:5px;border:1px solid rgba(255,255,255,0.12);
  background:transparent;color:#94a3b8;font-size:0.75rem;font-family:monospace;
  cursor:pointer;transition:all 0.15s;line-height:1.6;
}
.lang-btn:hover{color:#e2e8f0;border-color:rgba(255,255,255,0.25);}
.lang-btn.active{background:rgba(56,189,248,0.15);border-color:rgba(56,189,248,0.4);color:#38bdf8;}
.code-panel-header .lang-filename{opacity:0.5;font-size:0.78rem;}
`;
  document.head.appendChild(style);

  // ── Syntax highlighter ──
  // Returns array of {html} objects (one per line), matching CODE_LINES format
  function hlCode(plainText, lang) {
    const lines = plainText.split('\n');
    return lines.map(function (raw) {
      if (!raw.trim()) return { html: '' };
      let s = raw
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      if (lang === 'go') {
        s = s.replace(/\/\/.*/g, function (m) { return '<span class="cm">' + m + '</span>'; });
        s = s.replace(/"(?:[^"\\]|\\.)*"/g, function (m) { return '<span class="st">' + m + '</span>'; });
        s = s.replace(/\b(package|import|func|return|for|if|else|var|const|type|struct|interface|map|chan|go|defer|select|case|break|continue|range|make|new|len|cap|append|copy|delete|close|nil|true|false|int|int64|string|bool|byte|rune|float64|float32|error)\b/g,
          '<span class="kw">$1</span>');
        s = s.replace(/\b(fmt|math|sort|strings|strconv|os|io|bufio|sync|atomic|rand|time|log)\b/g,
          '<span class="pkg">$1</span>');
        s = s.replace(/\b([A-Z][a-zA-Z0-9]*)\b/g, '<span class="fn">$1</span>');
        s = s.replace(/\b(\d+)\b/g, '<span class="num">$1</span>');
      } else if (lang === 'js') {
        s = s.replace(/\/\/.*/g, function (m) { return '<span class="cm">' + m + '</span>'; });
        s = s.replace(/'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`/g,
          function (m) { return '<span class="st">' + m + '</span>'; });
        s = s.replace(/\b(function|const|let|var|return|for|of|in|if|else|while|do|break|continue|new|delete|typeof|instanceof|class|extends|import|export|default|null|undefined|true|false|this|super|async|await|throw|try|catch|finally)\b/g,
          '<span class="kw">$1</span>');
        s = s.replace(/\b([A-Z][a-zA-Z0-9]*)\b/g, '<span class="fn">$1</span>');
        s = s.replace(/\b(\d+)\b/g, '<span class="num">$1</span>');
        // function names
        s = s.replace(/\b([a-z][a-zA-Z0-9]*)(?=\s*\()/g, '<span class="fn">$1</span>');
      } else if (lang === 'py') {
        s = s.replace(/#.*/g, function (m) { return '<span class="cm">' + m + '</span>'; });
        s = s.replace(/'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/g,
          function (m) { return '<span class="st">' + m + '</span>'; });
        s = s.replace(/\b(def|class|return|for|if|elif|else|while|break|continue|import|from|as|with|in|not|and|or|is|None|True|False|pass|raise|try|except|finally|lambda|yield|global|nonlocal|del|len|range|print|sorted|list|dict|set|tuple|str|int|float|bool|min|max|sum|zip|enumerate|map|filter|reversed|append)\b/g,
          '<span class="kw">$1</span>');
        s = s.replace(/\b(\d+)\b/g, '<span class="num">$1</span>');
        s = s.replace(/\b([a-z][a-zA-Z0-9_]*)(?=\s*\()/g, '<span class="fn">$1</span>');
      }

      // Convert leading spaces to &nbsp; (preserve indentation)
      s = s.replace(/^(\s+)/, function (m) { return m.replace(/ /g, '&nbsp;'); });
      return { html: s };
    });
  }

  // Filenames per language
  var FILENAMES = { go: '.go', js: '.js', py: '.py' };

  // ── Public API ──
  window.LangSwitcher = {
    current: 'go',
    codeLinesCache: {},

    // Call once per page after defining LANG_PLAIN
    init: function (renderCodeFn) {
      this._renderFn = renderCodeFn;
      this._buildSwitcher();
    },

    // Get CODE_LINES-compatible array for given language
    getLines: function (lang) {
      if (!this.codeLinesCache[lang]) {
        var plain = (window.LANG_PLAIN || {})[lang];
        if (!plain) return null;
        this.codeLinesCache[lang] = hlCode(plain, lang);
      }
      return this.codeLinesCache[lang];
    },

    // Returns highlight lines for current step. Fallback keeps the active step visible
    // on pages that have not defined language-specific line maps yet.
    getHL: function (step) {
      if (this.current === 'go') return step.highlightLines || [];
      if (this.current === 'js' && step.hlJs) return step.hlJs;
      if (this.current === 'py' && step.hlPy) return step.hlPy;
      return step.highlightLines || [];
    },

    _buildSwitcher: function () {
      var nav = document.querySelector('nav');
      if (!nav) return;
      var wrap = document.createElement('div');
      wrap.className = 'lang-switcher';
      var self = this;
      ['go', 'js', 'py'].forEach(function (lang) {
        var btn = document.createElement('button');
        btn.className = 'lang-btn' + (lang === 'go' ? ' active' : '');
        btn.textContent = lang === 'py' ? 'Python' : lang === 'js' ? 'JS' : 'Go';
        btn.dataset.lang = lang;
        btn.addEventListener('click', function () { self.switch(lang); });
        wrap.appendChild(btn);
      });
      nav.appendChild(wrap);
    },

    switch: function (lang) {
      if (lang !== 'go' && (!window.LANG_PLAIN || !window.LANG_PLAIN[lang])) return;
      this.current = lang;
      document.querySelectorAll('.lang-btn').forEach(function (b) {
        b.classList.toggle('active', b.dataset.lang === lang);
      });
      // Update filename label
      var fn = document.querySelector('.code-panel-header [data-base], .code-panel-header .lang-filename, .code-panel-header span:not(.code-dot)');
      if (fn) {
        var base = fn.dataset.base || fn.textContent.replace(/\.[^.]+$/, '');
        fn.dataset.base = base;
        fn.textContent = base + FILENAMES[lang];
      }
      if (this._renderFn) this._renderFn();
    }
  };
})();
