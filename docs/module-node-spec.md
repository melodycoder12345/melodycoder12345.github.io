# Module / Node / Page 维护规范

本规范用于约束本项目后续新增或修改 `module`、知识星图 `node`、三级页面。目标不是做一个能打开的页面，而是把学习路径、图谱关系、页面交互和内容解释都做完整。

## 总体原则

- 不做最小可用版本。新增内容前先想清楚：这个主题属于哪个学习模块、读者为什么需要它、它和哪些已有节点有关、是否需要动画、边界情况有哪些、如何验证页面没有问题。
- 默认读者可能第一次接触该概念。概念型页面必须把背景、核心术语、运行机制、常见误区、工程场景讲清楚，不能只堆关键词。
- 页面只支持 PC 浏览。新增页面以桌面浏览器的信息密度、动画完整性、代码可读性为优先，不再为了移动端布局做妥协。
- 交互必须稳定。动画、按钮、步骤文案、高亮状态、返回路径、星图跳转都要经过检查，不能出现状态残留、错位、文案和画面不一致。

## 新增 Module Checklist

新增顶级 module 时，至少同步以下位置：

- 新增目录：`<module>/`。
- 新增模块首页：`<module>/index.html`，用于承载该 module 的学习入口、专题分组和推荐路径。
- 更新首页入口：`index.html` 中补模块入口或导航卡片。
- 更新知识源数据：在 `knowledge/modules.json`、`knowledge/nodes/<module>.json` 和 `knowledge/relations.json` 中补模块、节点与关系，然后运行 `npm run knowledge:check`。
- 更新知识星图：`graph.html` 中补模块颜色变量、legend、筛选和 hover / 选中说明。
- 更新架构图：`architecture.html` 中补模块坐标、层级归属、legend 和 hover / 选中说明。
- 更新导航识别：`nav.js` 中补 `MODULE_RE`、`moduleInfo()`、必要的最近访问分类信息。
- 更新页脚识别：`footer.js` 中补 module 路由识别，避免新增目录无法被全局组件识别。
- 更新模块关系文档：`modules-map.md` 如涉及顶级模块、迁移关系或架构层级，需要同步。
- 页面画像与节点定义存放在同一个 `knowledge/nodes/<module>.json` 对象中，不再单独维护。
- 同步 Obsidian 笔记：在 Obsidian Vault 对应目录下创建该 module 的子目录和 `README.md`，并在 Vault 根目录 `README.md` 补充入口；后续每新增三级页面都需同步对应 `.md` 笔记，遵守 `docs/obsidian-sync.md` 规范。

## Graph Node 规范

所有图谱节点都在 `knowledge/nodes/` 下按模块维护，`knowledge-data.js` 是自动生成产物，不应手工编辑。

- 修改结构化数据后运行 `npm run knowledge:build` 更新生成文件。
- 提交前运行 `npm run knowledge:generated:check`；该命令只比较文件，不会改写工作树，适合在 CI 中阻止遗漏生成文件。

- `id` 必须唯一、稳定，后续不要随意改名；跨模块边会依赖它。
- `module` 必须匹配 `GRAPH_MODULES` 的 key。
- `type` 只使用 `module` 或 `page`。
- `href` 使用相对路径，例如 `distributed/raft.html`。
- `desc` 使用一句话说明：它是什么、为什么重要、和哪些工程场景有关。
- `GRAPH_EDGES` 只引用已经存在的节点，表达学习关系、原理关系、实现关系或工程关联，不表示代码 import。
- 新增 node 时优先补关键关系边，不要为了连线数量随意制造弱关系。
- 模块归属由节点的 `module` 字段表达，不为“同属一个模块”创建语义边，也不把 module 节点作为语义关系端点。

## Knowledge Relation 规范

知识关系由 `knowledge/relations.json` 统一管理，详情页与知识星图通过生成的 `knowledge-data.js` 消费同一份数据。

- 关系类型只使用 `prerequisite`、`mechanism`、`causal`、`composition`、`application`、`contrast`、`analogy`。
- 每条关系必须有明确的 `source`、`target`、`type` 和专属 `summary`；不能用“两个知识点有关”替代关系解释。
- `prerequisite`、`mechanism`、`causal`、`application` 是有向关系；`composition`、`contrast`、`analogy` 默认无向。
- `analogy` 必须说明类比边界，`contrast` 应说明关键差异，避免建立误导性联系。
- 自动生成的关系标记为 `generated`，只承担兼容迁移；重要关系补充人工说明并标记为 `reviewed`。
- 普通知识点优先保留 3～7 条高价值关系，弱关系应删除，不以连线数量作为完整性标准。
- `generated` 关系只保存在 `knowledge/relation-candidates.json` 中等待审核，不进入正式图谱；允许页面暂时没有强关系。
- `npm run knowledge:validate` 将关系连接度作为覆盖信息输出，而不是正确性警告：零关系节点进入“待补正式关系”清单，1～2 条关系和超过 7 条关系仅用于观察稀疏节点与知识枢纽。需要展开完整清单时运行 `node scripts/validate-knowledge.js --verbose-coverage`。

## Graph / Architecture 交互说明

`graph.html` 和 `architecture.html` 是全局认知入口，新增 module 或 node 时不能只让点显示出来。

- `graph.html` 中 hover / 选中节点时，应能看到节点标题、模块、描述和相关节点。
- `architecture.html` 中 hover / 选中模块或模块连线时，应能解释模块含义、跨模块连接原因和代表性知识点。
- 新增 module 后必须检查 legend、筛选、统计数量、节点跳转、双击跳转和返回星图行为。
- 从星图打开页面时，应保留 `?from=graph&node=...` 这类来源信息，并让页面返回按钮回到星图。

## 完整页面架构

详情页按以下层次组织，同时兼容既有静态 HTML：

1. `knowledge/nodes/<module>.json` 同时描述页面主题、难度、呈现方式、交互方式和学习目标。
2. `page-framework.js` 渲染学习定位条，不侵入专题动画的 flex/grid 布局。
3. `page-blocks.js` 渲染普通内容块，并通过注册式专题 Renderer 承载复杂动画或实验。
4. 原有专题 HTML/动画继续作为页面主体，迁移时不为了数据化降低交互质量。
5. `knowledge/relations.json` 与 `knowledge-panel.js` 提供关系查询；`page-framework.js` 复用详情页原有标题作为完整学习关系入口。桌面端悬停或键盘聚焦标题时展示学习目标与完整知识关系浮层，点击标题可固定；移动端通过点击标题打开。
6. `learning.orientation` 可保留首次接触者需要的背景、问题、体系位置和学完自检信息，但共享框架不自动把它插入页面正文，避免挤压原有动画和专题布局。

页面画像只保留参与校验或渲染的字段。通用区域最大宽度为 1240px，正文与扩展内容建议控制在 960～1100px；关系区必须是专题容器的后继兄弟，不能插入动画主网格。

## 面包屑与返回规则

- 所有页面都应加载 `nav.js`，复用统一面包屑。
- 页面内不要重复实现一套与 `nav.js` 冲突的面包屑逻辑。
- 从星图进入页面后，本地返回入口应回到星图。
- 普通进入页面时，返回入口应回到所属 module 首页。
- 新增页面后需要检查：模块首页进入、星图进入、浏览器返回、页面内返回按钮四种路径。

## PC-only 页面策略

- 以桌面宽屏为主要目标，优先保证 1280px 及以上宽度体验。
- 动画或实验页面可以使用三栏、宽画布、右侧步骤面板等 PC 友好布局。
- 不再为了手机端隐藏关键内容或压缩交互。
- 可以保留基础 CSS 防止极端溢出，但不要为了移动端牺牲 PC 的信息密度。

## 实现前思考清单

新增内容前先回答这些问题：

- 这个主题属于哪个 module？是否需要新增 module？
- 它和已有哪些 node 有强关系？这些关系为什么成立？
- 页面的 kind、presentations 和 interaction 是什么？是否真的需要动画？
- 如果需要动画，完整流程和边界情况有哪些？
- 如果是概念页，第一次接触的人读完能不能讲清楚它是什么、为什么存在、怎么工作？
- 是否填写了 `learning.orientation`，并说明它在整个技术栈中的上游、下游和推荐学习顺序？
- 是否需要代码区？代码是否和文字、动画步骤对应？
- `graph.html` / `architecture.html` hover 文案是否足够解释清楚？
- 入口、返回、面包屑、星图跳转、页面画像是否都同步了？

## 验证清单

每次新增或修改 module / node / 三级页面后，至少验证：

- 页面在 PC 浏览器中布局正常，没有横向错位、遮挡、内容溢出。
- 星图中可以搜索、筛选、hover、选中、打开新增节点。
- 架构图中新增 module 的位置、连线、hover / 选中说明正常。
- 从星图进入页面后，返回入口能回到星图。
- 从 module 首页进入页面后，返回入口能回到 module 首页。
- 动画页的播放、暂停、上一步、下一步、重置稳定。
- 动画覆盖了正常路径、边界情况和异常或特殊分支。
- 动画页面已覆盖四类场景：正常路径、边界情况、故障/异常路径、恢复/对比，缺少任何一类须补齐。
- 页面画像已经同步。
- Obsidian Vault 中对应笔记已创建或更新，`[[wiki 链接]]` 指向已存在的笔记，无悬空链接。
