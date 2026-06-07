#!/usr/bin/env python3
"""
Upgrade Pattern A pages:
- Upgrade speed-wrap CSS to card style
- Upgrade input[type=range] CSS
- Upgrade desc-box CSS (inline flex)
- Move desc-box from viz-panel to controls (after btnNext)
- Upgrade old speed-wrap HTML to new labelled version (including desc-box)
- Upgrade JS: SPEED array, SPEED_LABELS, speedVal, updateSpeedLabel
"""

import re
import sys

BASE = '/Users/hudan/www/blog'

# 39 files: turtle emoji 🐢/🐇, id="descText"
GROUP1_FILES = [
    'algo/avl-tree.html',
    'algo/b-plus-tree.html',
    'algo/b-tree.html',
    'algo/bellman-ford.html',
    'algo/bfs.html',
    'algo/binary-search-tree.html',
    'algo/binary-search.html',
    'algo/bipartite-matching.html',
    'algo/dfs.html',
    'algo/dijkstra.html',
    'algo/hash-table.html',
    'algo/heap.html',
    'algo/hld.html',
    'algo/kruskal.html',
    'algo/linked-list.html',
    'algo/queue.html',
    'algo/stack.html',
    'algo/suffix-array.html',
    'algo/tarjan-scc.html',
    'algo/tree-traversal.html',
    'algo/trie.html',
    'db/buffer-pool.html',
    'kafka/consumer-group.html',
    'kafka/consumer.html',
    'kafka/kafka-overview.html',
    'kafka/partition-replication.html',
    'kafka/producer.html',
    'network/dns.html',
    'network/http.html',
    'network/load-balancing.html',
    'network/tcp-congestion.html',
    'network/tcp-handshake.html',
    'linux/commands.html',
    'linux/filesystem.html',
    'linux/io-models.html',
    'linux/process-lifecycle.html',
    'linux/scheduling.html',
    'linux/virtual-memory.html',
    'redis/data-types.html',
]

# 3 db files: "速度/快" format speed-wrap, some use id="desc" instead of "descText"
GROUP2_FILES = [
    'db/external-sort.html',   # no desc-box in viz-panel
    'db/join-algo.html',       # uses id="desc"
    'db/query-plan.html',      # uses id="desc"
]

NEW_SPEED_WRAP_CSS = (
    '.speed-wrap{background:rgba(255,255,255,0.04);border:1px solid var(--border);'
    'border-radius:8px;padding:6px 14px;display:flex;align-items:center;gap:10px;}\n'
    '.speed-wrap .speed-label{color:var(--text);font-weight:600;white-space:nowrap;font-size:0.8rem;}\n'
    '.speed-val{font-family:monospace;font-size:0.78rem;color:var(--blue);min-width:26px;text-align:center;}'
)

NEW_DESC_BOX_CSS = (
    '.desc-box{display:flex;align-items:center;gap:10px;flex:1;min-width:0;'
    'overflow:hidden;font-size:0.83rem;color:var(--dim);padding:0 4px;}\n'
    '.desc-box #descText{flex:1;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;}'
)

NEW_SPEED_WRAP_HTML = (
    '  <div class="speed-wrap">\n'
    '    <span class="speed-label">速度</span>\n'
    '    <span class="speed-label" style="font-weight:400;color:var(--dim)">慢</span>\n'
    '    <input type="range" id="speedRange" min="1" max="5" value="3">\n'
    '    <span class="speed-label" style="font-weight:400;color:var(--dim)">快</span>\n'
    '    <span class="speed-val" id="speedVal">中速</span>\n'
    '  </div>'
)

SPEED_LABELS_JS = "const SPEED_LABELS = ['极慢','慢','中速','快','极快'];"
SPEED_VAL_JS = (
    "const speedVal = document.getElementById('speedVal');\n"
    "function updateSpeedLabel(){speedVal.textContent=SPEED_LABELS[parseInt(speedRange.value)-1];}\n"
    "speedRange.addEventListener('input',updateSpeedLabel);\n"
    "updateSpeedLabel();"
)


def upgrade_css(content):
    """Apply CSS upgrades (speed-wrap, desc-box, step-counter, input[type=range])."""
    # 1. Replace speed-wrap CSS (gap:6px or gap:8px)
    content = re.sub(
        r'\.speed-wrap\{display:flex;align-items:center;gap:\d+px;margin-left:auto;[^}]+\}',
        NEW_SPEED_WRAP_CSS,
        content
    )
    # 2. Replace desc-box CSS (padding varies: 10px/12px, 20px/24px)
    content = re.sub(
        r'\.desc-box\{padding:\d+px \d+px;background:rgba\(255,255,255,0\.0[23]\);border-top:1px solid var\(--border\);[^}]+\}',
        NEW_DESC_BOX_CSS,
        content
    )
    # 3. Update step-counter: replace margin-left:auto with flex-shrink:0
    content = re.sub(
        r'\.step-counter\{margin-left:auto;(font-size:0\.8rem;color:var\(--dim\);font-family:monospace;white-space:nowrap;)\}',
        r'.step-counter{\1flex-shrink:0;}',
        content
    )
    # 4. Upgrade input[type=range] width (80px/90px)→130px, height 4px→5px
    content = re.sub(
        r'(input\[type=range\]\{-webkit-appearance:none;width:)\d+px(;height:)4px(;)',
        r'\g<1>130px\g<2>5px\g<3>',
        content
    )
    # Upgrade thumb 14px→16px, add box-shadow
    content = re.sub(
        r'(input\[type=range\]::-webkit-slider-thumb\{-webkit-appearance:none;width:)14px(;height:)14px(;border-radius:50%;background:[^;]+;cursor:pointer;)\}',
        r'\g<1>16px\g<2>16px\g<3>box-shadow:0 0 6px rgba(56,189,248,0.5);}',
        content
    )
    return content


def upgrade_html_group1(content):
    """Move desc-box from viz-panel to controls, replace turtle speed-wrap with new version."""
    # 1. Capture the existing desc-box content to preserve the initial text
    m = re.search(
        r'<div class="desc-box">\s*<span id="descText">([^<]*)</span>\s*<span class="step-counter" id="stepCounter">([^<]*)</span>\s*</div>',
        content, re.DOTALL
    )
    if m:
        init_text = m.group(1)
        init_counter = m.group(2)
    else:
        init_text = '点击播放开始演示'
        init_counter = '0 / 0'

    # 2. Remove desc-box from viz-panel
    content = re.sub(
        r'\s*<div class="desc-box">\s*<span id="descText">[^<]*</span>\s*<span class="step-counter" id="stepCounter">[^<]*</span>\s*</div>',
        '',
        content
    )

    # 3. Replace turtle speed-wrap HTML with desc-box + new speed-wrap
    new_html = (
        f'  <div class="desc-box"><span id="descText">{init_text}</span>'
        f'<span class="step-counter" id="stepCounter">{init_counter}</span></div>\n'
        + NEW_SPEED_WRAP_HTML
    )
    content = re.sub(
        r'<div class="speed-wrap">\s*<span>🐢</span>\s*<input type="range" id="speedRange"[^>]*>\s*<span>🐇</span>\s*</div>',
        new_html,
        content, flags=re.DOTALL
    )
    return content


def upgrade_html_group2(content, desc_id='desc'):
    """Handle 速度/快 format speed-wrap; desc-box may use id='desc' or be absent."""
    has_desc = f'id="{desc_id}"' in content or 'class="desc-box"' in content

    if has_desc:
        # Capture existing desc-box
        m = re.search(
            rf'<div class="desc-box">\s*<span id="{desc_id}">([^<]*)</span>\s*<span class="step-counter" id="stepCounter">([^<]*)</span>\s*</div>',
            content, re.DOTALL
        )
        if m:
            init_text = m.group(1)
            init_counter = m.group(2)
        else:
            init_text = '点击播放开始演示'
            init_counter = ''

        # Remove from viz-panel
        content = re.sub(
            rf'\s*<div class="desc-box">\s*<span id="{desc_id}">[^<]*</span>\s*<span class="step-counter" id="stepCounter">[^<]*</span>\s*</div>',
            '', content
        )

        new_desc_html = (
            f'  <div class="desc-box"><span id="{desc_id}">{init_text}</span>'
            f'<span class="step-counter" id="stepCounter">{init_counter}</span></div>\n'
        )
    else:
        new_desc_html = ''

    # Replace 速度/快 speed-wrap
    new_html = new_desc_html + NEW_SPEED_WRAP_HTML
    content = re.sub(
        r'<div class="speed-wrap">\s*<span>速度</span>\s*<input type="range" id="speedRange"[^>]*>\s*<span>快</span>\s*</div>',
        new_html,
        content, flags=re.DOTALL
    )
    return content


def upgrade_js(content):
    """Upgrade SPEED array, add SPEED_LABELS and speedVal/updateSpeedLabel."""
    # Skip if already upgraded
    if 'SPEED_LABELS' in content and 'speedVal' in content:
        return content

    # 1. Update SPEED array (handles spaces and no-spaces variants)
    content = re.sub(
        r'(const|let|var)\s+SPEED\s*=\s*\[[^\]]+\];',
        f'const SPEED = [2000,1200,700,350,120];\n{SPEED_LABELS_JS}',
        content
    )

    # 2. Add speedVal + updateSpeedLabel
    if 'getElementById(\'speedVal\')' not in content and 'getElementById("speedVal")' not in content:
        # Case A: speedRange is a standalone const/let declaration
        m = re.search(
            r"((?:const|let|var)\s+speedRange\s*=\s*document\.getElementById\(['\"]speedRange['\"]\);)",
            content
        )
        if m:
            content = content.replace(
                m.group(0),
                m.group(0) + '\n' + SPEED_VAL_JS,
                1
            )
        else:
            # Case B: speedRange is in a comma-separated multi-var block
            # Find the end of that block (ends with ';') and insert after
            m2 = re.search(
                r"(speedRange\s*=\s*document\.getElementById\(['\"]speedRange['\"]\))(,[^\n]+)*?\n([^\n]*);",
                content
            )
            if m2:
                # Find the semicolon that ends the var block (could be on same line or later)
                # Strategy: find 'speedRange=...' line, then find the next ';' that terminates the statement
                idx = content.find("speedRange=document.getElementById('speedRange')")
                if idx == -1:
                    idx = content.find('speedRange=document.getElementById("speedRange")')
                if idx != -1:
                    # find next semicolon that ends the statement
                    semi_idx = content.find(';', idx)
                    if semi_idx != -1:
                        eol = content.find('\n', semi_idx)
                        if eol == -1:
                            eol = len(content)
                        content = content[:eol] + '\n' + SPEED_VAL_JS + content[eol:]
            else:
                # Case C: speedRange used inline in tick() — add standalone init before first event listener
                m3 = re.search(r"(btnPlay\.addEventListener|btnNext\.addEventListener)", content)
                if m3:
                    insert_pos = m3.start()
                    new_code = (
                        "const speedVal = document.getElementById('speedVal');\n"
                        "function updateSpeedLabel(){speedVal.textContent=SPEED_LABELS[parseInt(document.getElementById('speedRange').value)-1];}\n"
                        "document.getElementById('speedRange').addEventListener('input',updateSpeedLabel);\n"
                        "updateSpeedLabel();\n\n"
                    )
                    content = content[:insert_pos] + new_code + content[insert_pos:]

    return content


def upgrade_file(path, dry_run=False):
    """Process a single file. Returns (changed, summary)."""
    import os
    full_path = os.path.join(BASE, path)
    with open(full_path, encoding='utf-8') as f:
        original = f.read()

    content = original

    # Determine group
    if path in GROUP2_FILES:
        content = upgrade_css(content)
        desc_id = 'desc' if 'id="desc"' in content else 'descText'
        content = upgrade_html_group2(content, desc_id)
    else:
        content = upgrade_css(content)
        content = upgrade_html_group1(content)

    content = upgrade_js(content)

    changed = content != original

    if changed:
        if dry_run:
            # Show a short summary of what changed
            orig_lines = original.splitlines()
            new_lines = content.splitlines()
            print(f'\n--- {path} ---')
            diffs = 0
            for i, (a, b) in enumerate(zip(orig_lines, new_lines)):
                if a != b and diffs < 5:
                    print(f'  L{i+1}: -{a[:80]}')
                    print(f'       +{b[:80]}')
                    diffs += 1
            if len(new_lines) != len(orig_lines):
                print(f'  (line count: {len(orig_lines)} → {len(new_lines)})')
        else:
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f'  ✓ written: {path}')
    else:
        print(f'  - no change: {path}')

    return changed


def main():
    dry_run = '--dry-run' in sys.argv or '-n' in sys.argv
    write_mode = '--write' in sys.argv

    if not dry_run and not write_mode:
        print('Usage: python3 upgrade_a_pages.py [--dry-run | --write]')
        print('  --dry-run : show what would change (no writes)')
        print('  --write   : apply all changes')
        sys.exit(1)

    if dry_run:
        print('=== DRY RUN (no files written) ===\n')
    else:
        print('=== WRITE MODE ===\n')

    all_files = GROUP1_FILES + GROUP2_FILES
    changed_count = 0
    for path in all_files:
        changed = upgrade_file(path, dry_run=dry_run)
        if changed:
            changed_count += 1

    print(f'\nDone: {changed_count}/{len(all_files)} files {"would be changed" if dry_run else "changed"}.')


if __name__ == '__main__':
    main()
