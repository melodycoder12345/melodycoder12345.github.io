#!/usr/bin/env python3
"""Upgrade lp-controls pages: speed-row → card style + speedVal."""
import re, sys, os

BASE = '/Users/hudan/www/blog'

NEW_SPEED_ROW_CSS = (
    '.speed-row{background:rgba(255,255,255,0.04);border:1px solid var(--border);'
    'border-radius:8px;padding:6px 14px;display:flex;align-items:center;gap:10px;margin-top:6px;}\n'
    '.speed-row .speed-label{color:var(--text);font-weight:600;white-space:nowrap;font-size:0.8rem;}\n'
    '.speed-val{font-family:monospace;font-size:0.78rem;color:var(--blue);min-width:26px;text-align:center;}'
)

NEW_SPEED_WRAP_CSS = (
    '.speed-wrap{background:rgba(255,255,255,0.04);border:1px solid var(--border);'
    'border-radius:8px;padding:6px 14px;display:flex;align-items:center;gap:10px;}\n'
    '.speed-wrap .speed-label{color:var(--text);font-weight:600;white-space:nowrap;font-size:0.8rem;}\n'
    '.speed-val{font-family:monospace;font-size:0.78rem;color:var(--blue);min-width:26px;text-align:center;}'
)

SPEED_LABELS_JS = "const SPEED_LABELS = ['极慢','慢','中速','快','极快'];"
SPEED_ARRAY_JS = 'const SPEED = [2000,1200,700,350,120];'


def upgrade_speed_row_css(content):
    """Replace .speed-row CSS with card style."""
    return re.sub(
        r'\.speed-row\{display:flex;align-items:center;gap:\d+px;[^}]+\}',
        NEW_SPEED_ROW_CSS,
        content
    )


def upgrade_speed_row_html_turtle(content):
    """Replace turtle-emoji speed-row HTML."""
    new_html = (
        '<div class="speed-row">\n'
        '    <span class="speed-label">速度</span>\n'
        '    <span class="speed-label" style="font-weight:400;color:var(--dim)">慢</span>\n'
        '    <input type="range" id="speedRange" min="1" max="5" value="3">\n'
        '    <span class="speed-label" style="font-weight:400;color:var(--dim)">快</span>\n'
        '    <span class="speed-val" id="speedVal">中速</span>\n'
        '  </div>'
    )
    return re.sub(
        r'<div class="speed-row">\s*<span>🐢</span>\s*<input type="range" id="speedRange"[^>]*>\s*<span>🐇</span>\s*</div>',
        new_html, content, flags=re.DOTALL
    )


def upgrade_speed_row_html_text(content):
    """Replace 慢/快 speed-row HTML (various forms)."""
    new_inner = (
        '\n        <span class="speed-label">速度</span>\n'
        '        <span class="speed-label" style="font-weight:400;color:var(--dim)">慢</span>\n'
        '        <input type="range" id="speedRange" min="1" max="5" value="3">\n'
        '        <span class="speed-label" style="font-weight:400;color:var(--dim)">快</span>\n'
        '        <span class="speed-val" id="speedVal">中速</span>\n'
        '      '
    )
    # Handles: <span>慢</span><input ...><span>快</span>  (inline or with whitespace)
    return re.sub(
        r'(<div class="speed-row">)\s*<span>慢</span>\s*<input type="range" id="speedRange"[^>]*>\s*<span>快</span>\s*(</div>)',
        r'\1' + new_inner + r'\2',
        content, flags=re.DOTALL
    )


def upgrade_js_speed(content, old_speed_pattern=None):
    """Upgrade SPEED array and add SPEED_LABELS + speedVal."""
    if 'SPEED_LABELS' in content:
        return content  # already done

    # Update SPEED array
    content = re.sub(
        r'(const|let|var)\s+SPEED\s*=\s*\[[^\]]+\];',
        f'{SPEED_ARRAY_JS}\n{SPEED_LABELS_JS}',
        content
    )

    if "getElementById('speedVal')" not in content and 'getElementById("speedVal")' not in content:
        speed_val_js = (
            "const speedVal = document.getElementById('speedVal');\n"
            "function updateSpeedLabel(){speedVal.textContent=SPEED_LABELS[parseInt(document.getElementById('speedRange').value)-1];}\n"
            "document.getElementById('speedRange').addEventListener('input',function(){updateSpeedLabel();});\n"
            "updateSpeedLabel();"
        )
        # Insert after SPEED_LABELS definition
        idx = content.find(SPEED_LABELS_JS)
        if idx != -1:
            end = content.find('\n', idx) + 1
            content = content[:end] + speed_val_js + '\n' + content[end:]

    return content


def add_speed_wrap_to_controls_page(content, init_delay_ms):
    """For pages with .controls but no speed: add speed-wrap after btnNext and upgrade JS."""
    # Add CSS
    if '.speed-wrap' not in content:
        # Insert before first .ctrl { CSS rule
        content = re.sub(
            r'(\.ctrl\s*\{)',
            NEW_SPEED_WRAP_CSS + '\n\\1',
            content, count=1
        )
    # Upgrade input[type=range] CSS if present
    content = re.sub(
        r'(input\[type=range\]\{-webkit-appearance:none;width:)\d+px(;height:)\d+px(;)',
        r'\g<1>130px\g<2>5px\g<3>',
        content
    )

    # Add speed-wrap HTML after btnNext
    new_html = (
        '\n        <div class="desc-box"><span id="descText">点击播放开始演示</span>'
        '<span class="step-counter" id="stepCounter"></span></div>\n'
        '        <div class="speed-wrap">\n'
        '          <span class="speed-label">速度</span>\n'
        '          <span class="speed-label" style="font-weight:400;color:var(--dim)">慢</span>\n'
        '          <input type="range" id="speedRange" min="1" max="5" value="3">\n'
        '          <span class="speed-label" style="font-weight:400;color:var(--dim)">快</span>\n'
        '          <span class="speed-val" id="speedVal">中速</span>\n'
        '        </div>'
    )
    content = re.sub(
        r'(<button[^>]*id="btnNext"[^>]*>下一步 ▶</button>)',
        r'\1' + new_html,
        content
    )

    # Add desc-box CSS
    if '.desc-box' not in content:
        desc_css = (
            '.desc-box{display:flex;align-items:center;gap:10px;flex:1;min-width:0;overflow:hidden;font-size:0.83rem;color:var(--dim);padding:0 4px;}\n'
            '.step-counter{font-size:0.8rem;color:var(--dim);font-family:monospace;white-space:nowrap;flex-shrink:0;}\n'
        )
        content = re.sub(r'(\.ctrl\s*\{)', desc_css + r'\1', content, count=1)

    # Add SPEED array in JS
    if 'const SPEED' not in content:
        speed_js = (
            f'{SPEED_ARRAY_JS}\n'
            f'{SPEED_LABELS_JS}\n'
            "const speedRange = document.getElementById('speedRange');\n"
            "const speedVal = document.getElementById('speedVal');\n"
            "function updateSpeedLabel(){speedVal.textContent=SPEED_LABELS[parseInt(speedRange.value)-1];}\n"
            "speedRange.addEventListener('input',updateSpeedLabel);\n"
            "updateSpeedLabel();\n"
        )
        # Insert before togglePlay function
        content = re.sub(
            r'(function togglePlay\(\))',
            speed_js + r'\1',
            content, count=1
        )

    # Replace hardcoded setInterval delay with SPEED-based
    content = re.sub(
        rf'(setInterval\([^,]+,\s*){init_delay_ms}(\s*\))',
        r'\1SPEED[parseInt(speedRange.value)-1]\2',
        content
    )

    return content


def process_file(path, mode, dry_run=False):
    full = os.path.join(BASE, path)
    with open(full) as f:
        original = f.read()
    content = original

    if mode == 'speed-row-turtle':
        content = upgrade_speed_row_css(content)
        content = upgrade_speed_row_html_turtle(content)
        content = upgrade_js_speed(content)
    elif mode == 'speed-row-text':
        content = upgrade_speed_row_css(content)
        content = upgrade_speed_row_html_text(content)
        content = upgrade_js_speed(content)
    elif mode == 'add-speed':
        delay = int(mode.split(':')[1]) if ':' in mode else 2500
        content = add_speed_wrap_to_controls_page(content, delay)

    changed = content != original
    if changed:
        if not dry_run:
            with open(full, 'w') as f:
                f.write(content)
            print(f'  ✓ {path}')
        else:
            print(f'  [dry] would change: {path}')
    else:
        print(f'  - no change: {path}')
    return changed


FILES = [
    ('algo/prim.html', 'speed-row-turtle'),
    ('algo/red-black-tree.html', 'speed-row-text'),
    ('algo/fenwick-tree.html', 'speed-row-text'),
    ('algo/floyd-warshall.html', 'speed-row-text'),
    ('algo/aho-corasick.html', 'speed-row-text'),
]


if __name__ == '__main__':
    dry_run = '--dry-run' in sys.argv
    write = '--write' in sys.argv
    if not dry_run and not write:
        print('Usage: --dry-run | --write')
        sys.exit(1)

    for path, mode in FILES:
        process_file(path, mode, dry_run=dry_run)

    # max-flow and string-hashing: handled inline below
    for path, delay in [('algo/max-flow.html', 2500), ('algo/string-hashing.html', 2200)]:
        full = os.path.join(BASE, path)
        with open(full) as f:
            content = f.read()
        content = add_speed_wrap_to_controls_page(content, delay)
        if content != open(full).read():
            if write:
                with open(full, 'w') as f:
                    f.write(content)
                print(f'  ✓ {path}')
            else:
                print(f'  [dry] would change: {path}')
        else:
            print(f'  - no change: {path}')

    print('Done.')
