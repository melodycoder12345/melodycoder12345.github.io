# Channel.html 动画优化重构方案

## 目标
将 `golang/channel.html` 从 innerHTML 全量替换模式重构为**增量更新 + 声明式状态驱动**模式，让 CSS transition 生效、动画流畅。

---

## 核心设计

### 1. 声明式步骤数据
每个 scenario 的 `render(step)` 函数不再拼接 HTML 字符串，而是返回一个**状态描述对象**：

```js
render(step) {
  return {
    nodes: [
      { id: 'G1', type: 'goroutine', x: 80, y: 180, label: 'G1', state: 'active' },
      { id: 'ch', type: 'box', x: 250, y: 160, w: 120, h: 40, label: 'ch', state: 'active' },
    ],
    edges: [
      { id: 'G1->ch', from: [102, 180], to: [248, 180], color: '#38bdf8', animated: true },
    ],
    slots: [...],    // channel buffer slots
    annotations: [...], // text labels
  }
}
```

### 2. 增量渲染引擎 (内联)
不引入外部 JS 文件（保持单文件自包含），在 `<script>` 中增加一个轻量渲染引擎：

```
VizEngine:
  - initSVG(): 写入 defs，创建容器 <g> 分层
  - applyState(state): 对比 prevState，执行增量 DOM 操作
    - 新增节点: createElement + fadeIn animation
    - 移除节点: fadeOut animation + remove
    - 属性变化: 直接 setAttribute（CSS transition 处理平滑过渡）
    - 位置变化: FLIP 动画
```

### 3. CSS transition 真正生效
因为 DOM 元素持久化，以下 CSS 规则终于能起作用：
```css
.node-rect { transition: fill .35s, stroke .35s, filter .35s; }
.node-text { transition: fill .35s; }
.flow-arrow { stroke-dasharray: 8 5; animation: particle-flow 1.2s linear infinite paused; }
.flow-arrow.flowing { animation-play-state: running; }
```

---

## 实施步骤

### Step 1: 重构数据模型
将 4 个 scenario 的 `render(step)` 从命令式字符串拼接改为声明式状态返回。

每个 scenario 保留原有的 `label`、`steps`、`hl`、`code` 不变，只改 `render` 方法的返回值。

### Step 2: 实现内联渲染引擎
在 `<script>` 顶部添加 ~120 行的轻量引擎代码：

```js
const NS = 'http://www.w3.org/2000/svg';
const vizState = { nodes: new Map(), edges: new Map(), annotations: new Map() };

function initSVG() { /* 创建 defs + 分层 g 容器 */ }

function applyState(newState) {
  // diff nodes
  // diff edges  
  // diff annotations
  // 利用 CSS transition 实现平滑过渡
}
```

### Step 3: 修改 updateStep() 
```js
// 之前:
svgEl.style.opacity='0';
setTimeout(()=>{sc.render(curStep); svgEl.style.opacity='1';},120);

// 之后:
const state = sc.getState(curStep);  // 声明式状态
applyState(state);  // 增量更新，CSS transition 自动处理过渡
```

不再需要整体 fade in/out —— 单个元素的变化自带 transition 动画。

### Step 4: 增强动画效果
- 新增节点: `node-enter` animation (scale 0.6→1 + opacity 0→1)
- 移除节点: `node-exit` animation (scale 1→0.5 + opacity 1→0)  
- 流动箭头: class toggle 控制 `animation-play-state`
- 活跃节点: `glow-pulse` 不再被中断

### Step 5: 删除死代码
- 移除 `function lbl(){return'';}` 及所有调用（lbl 当前返回空字符串）
- 简化 hexToRgb（保留，仍在使用）

---

## 文件变更

只修改 1 个文件: `golang/channel.html`

变更内容:
1. **CSS 部分** — 新增 `.node-entering`, `.node-exiting`, `.flow-arrow.flowing` 等 class
2. **JS 部分** — 重写为: 渲染引擎 + 声明式数据模型 + 修改 updateStep()
3. **删除** — lbl() 函数及其调用

---

## 不变的部分

- HTML 结构（nav、steps-panel、diagram-panel、code-panel、controls、extras）完全不动
- 步骤描述文本、代码高亮、场景切换逻辑保持不变
- 视觉效果保持一致（颜色、布局、glow 效果）—— 只是变化过程变得平滑

---

## 验证方式

重构后应满足：
1. 所有 4 个 scenario 的每一步都能正确显示（元素位置/颜色/文字不变）
2. 步骤切换时可见平滑颜色过渡（不再闪烁）
3. flow-arrow 动画在步骤间不被中断
4. 快速连续点击不会出现闪烁/错乱
5. 无 console error
