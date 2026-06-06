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
- 更新图谱数据：`graph-data.js` 中补 `GRAPH_MODULES`、module node、page nodes、必要的 `GRAPH_EDGES`。
- 更新知识星图：`graph.html` 中补模块颜色变量、legend、筛选和 hover / 选中说明。
- 更新架构图：`architecture.html` 中补模块坐标、层级归属、legend 和 hover / 选中说明。
- 更新导航识别：`nav.js` 中补 `MODULE_RE`、`moduleInfo()`、必要的最近访问分类信息。
- 更新页脚识别：`footer.js` 中补 module 路由识别，避免新增目录无法被全局组件识别。
- 更新模块关系文档：`modules-map.md` 如涉及顶级模块、迁移关系或架构层级，需要同步。
- 更新本规范的三级页面登记表：新增或调整三级页面时必须记录页面类型。
- 同步 Obsidian 笔记：在 Obsidian Vault 对应目录下创建该 module 的子目录和 `README.md`，并在 Vault 根目录 `README.md` 补充入口；后续每新增三级页面都需同步对应 `.md` 笔记，遵守 `docs/obsidian-sync.md` 规范。

## Graph Node 规范

所有图谱节点都在 `graph-data.js` 中维护。

- `id` 必须唯一、稳定，后续不要随意改名；跨模块边会依赖它。
- `module` 必须匹配 `GRAPH_MODULES` 的 key。
- `type` 只使用 `module` 或 `page`。
- `href` 使用相对路径，例如 `distributed/raft.html`。
- `desc` 使用一句话说明：它是什么、为什么重要、和哪些工程场景有关。
- `GRAPH_EDGES` 只引用已经存在的节点，表达学习关系、原理关系、实现关系或工程关联，不表示代码 import。
- 新增 node 时优先补关键关系边，不要为了连线数量随意制造弱关系。

## Graph / Architecture 交互说明

`graph.html` 和 `architecture.html` 是全局认知入口，新增 module 或 node 时不能只让点显示出来。

- `graph.html` 中 hover / 选中节点时，应能看到节点标题、模块、描述和相关节点。
- `architecture.html` 中 hover / 选中模块或模块连线时，应能解释模块含义、跨模块连接原因和代表性知识点。
- 新增 module 后必须检查 legend、筛选、统计数量、节点跳转、双击跳转和返回星图行为。
- 从星图打开页面时，应保留 `?from=graph&node=...` 这类来源信息，并让页面返回按钮回到星图。

## 三级页面类型

新增三级页面前必须先判定类型。页面结构、内容深度和验证方式都跟类型绑定。

### A 类型：过程 / 算法 / 代码动画页

适合排序、搜索、数据结构操作、窗口移动、协议步骤中需要同时看过程和代码的主题。

结构要求：

- 左侧：场景切换标签和步骤导航（dot nav）等控制元素，不放与动画内容直接相关的解释文字。
- 中间：动画或交互演示，展示完整状态变化；动画下方放与当前步骤直接对应的说明文字。
- 右侧：代码或伪代码，跟动画步骤对应。

布局约束：

- 与动画步骤直接相关的说明文字，放在动画区域下方，不放在左侧面板。
- 动画内部尽量少放文字标注，优先用颜色、形状、箭头传达状态变化；必要的标注控制在 1-2 个词以内，避免在 SVG 画布内放多行说明文字。

动画要求：

- 参考 `algo` 模块下成熟三级页面的实现方式。
- 使用 step 数据驱动动画，避免把状态散落在多个临时变量里。
- 必须支持播放、暂停、上一步、下一步、重置。
- 必须覆盖核心流程、边界情况、失败或特殊分支，不能只演示 happy path。
- 高亮要清晰区分当前节点、已处理节点、候选节点、错误分支、最终结果。
- 步骤文案必须和画面同步，不能出现文字说的是上一步、画面停在下一步的情况。
- 视觉要好看：布局稳定、颜色克制、层级清楚、动画节奏可理解。

场景覆盖要求（缺少任何一类视为不完整）：

1. **正常路径** — 核心算法或操作流程的 happy path，逐步展示状态变化。
2. **边界情况** — 空输入、单元素、相同元素、极端参数（最大/最小规模），验证算法在边界仍正确。
3. **故障/异常路径** — 负权边、重复键、冲突插入、写失败、节点崩溃等异常分支。
4. **恢复/对比** — 故障后的自动修复过程，或与另一种算法/实现方案的执行步骤对比，帮助读者理解设计取舍。

参考方向：`algo/binary-search.html`、`algo/quick-sort.html` 等算法动画页。

### B 类型：文字 / 代码 / 长文概念页

适合语言基础、标准库、工程实践、系统知识点中以解释和代码为主的主题。

结构可选：

- 左右结构：左侧文字说明，右侧代码示例。
- 整体长文结构：页面主体是完整文字说明、分节 card、表格、代码块、Q&A、易错点。

内容要求：

- 默认读者没有先验知识，需要先解释背景和核心术语。
- 不能只写结论，要说明为什么这样设计、运行机制是什么、边界在哪里。
- 有代码时，代码必须服务于概念解释，避免放无关大段代码。
- 需要覆盖常见误区、面试或工程排查中容易混淆的点。
- 页面可以没有动画，但文字必须足够完整。

参考方向：`golang/type-system.html`、`golang/interface.html`、`golang/sync.html`。

### C 类型：概念 / 协议 / 系统流程动画页

适合 Raft、Paxos、CAP、KRaft、TCP 状态、缓存淘汰、复制协议等不一定依赖代码，但非常适合通过动画理解的主题。

结构要求：

- 文字说明必须完整，能独立解释概念背景、参与角色、状态机、关键流程和工程意义。
- 动画演示可以不放代码区，但必须展示完整过程。
- 每个动画步骤都要有明确标题和解释文案，放在动画区域下方，不放在左侧面板。
- 左侧面板只放场景切换标签和步骤导航控件。

动画要求：

- 覆盖主要状态转换、边界条件、异常情况和最终结果。
- 对协议类主题，至少考虑正常路径、失败路径、恢复路径、冲突或选举等特殊情况。
- 对系统流程类主题，至少考虑初始化、运行中变化、压力或故障条件、收敛结果。
- 视觉质量按 `algo` 模块动画页标准执行，确保节点、边、日志、计数器、状态标签都清晰可读。
- 动画内部节点和边的标签尽量精简，优先用视觉编码（颜色、虚线、高亮、大小）表达状态，避免在 SVG 中堆积长文字。
- 不允许只画静态示意图冒充动画演示。

场景覆盖要求（缺少任何一类视为不完整）：

1. **正常路径** — 核心协议或系统流程的 happy path，角色和消息流清晰可见。
2. **边界情况** — 单节点、空集群、零请求、TTL 恰好到期等边界状态。
3. **故障/异常路径** — 节点宕机、网络分区、消息丢失、超时、脑裂、冲突写入等真实故障场景；协议类必须覆盖选举冲突或日志不一致，系统流程类必须覆盖写失败或服务不可用。
4. **恢复/对比** — 故障后的自动恢复和状态收敛过程，或展示与其他协议/架构方案的关键差异（如 CP vs AP、推模式 vs 拉模式），帮助读者理解设计取舍。

参考方向：可复用 `algo` 模块的 step / controls / highlight 模式，内容深度参考 `golang` 模块长文页面。

## 三级页面登记表

每次新增或修改三级页面，都要同步本表。类型只能填写 `A`、`B`、`C`。

| 页面 | Module | Graph Node ID | 类型 | 动画 | 代码区 | 说明 |
|---|---|---|---|---|---|---|
| `algo/bubble-sort.html` | `algo` | `algo-bubble-sort` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `algo/selection-sort.html` | `algo` | `algo-selection-sort` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `algo/insertion-sort.html` | `algo` | `algo-insertion-sort` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `algo/merge-sort.html` | `algo` | `algo-merge-sort` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `algo/quick-sort.html` | `algo` | `algo-quick-sort` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `algo/heap-sort.html` | `algo` | `algo-heap-sort` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `algo/counting-sort.html` | `algo` | `algo-counting-sort` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `algo/radix-sort.html` | `algo` | `algo-radix-sort` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `algo/topological-sort.html` | `algo` | `topo` | A | 是 | 是 | 过程 / 代码动画页，使用 Kahn 入度队列演示 |
| `algo/binary-search.html` | `algo` | `binary-search` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `algo/kmp.html` | `algo` | `kmp` | A | 是 | 是 | 字符串匹配过程动画页，含 next 数组和代码区 |
| `algo/linked-list.html` | `algo` | `algo-linked-list` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `algo/stack.html` | `algo` | `algo-stack` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `algo/queue.html` | `algo` | `algo-queue` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `algo/heap.html` | `algo` | `heap` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `algo/hash-table.html` | `algo` | `hash` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `algo/skip-list.html` | `algo` | `skiplist` | A | 是 | 是 | 跳表查找 / 插入 / 删除过程动画页 |
| `algo/binary-search-tree.html` | `algo` | `algo-bst` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `algo/avl-tree.html` | `algo` | `algo-avl` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `algo/b-tree.html` | `algo` | `algo-btree` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `algo/b-plus-tree.html` | `algo` | `algo-bplus` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `algo/trie.html` | `algo` | `trie` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `algo/segment-tree.html` | `algo` | `segment-tree` | A | 是 | 是 | 区间查询和单点更新过程动画页 |
| `algo/tree-traversal.html` | `algo` | `algo-tree-traversal` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `algo/union-find.html` | `algo` | `union-find` | A | 是 | 是 | 并查集 find / union 与路径压缩过程动画页 |
| `algo/bfs.html` | `algo` | `bfs` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `algo/dfs.html` | `algo` | `dfs` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `algo/dijkstra.html` | `algo` | `dijkstra` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `algo/bellman-ford.html` | `algo` | `algo-bellman-ford` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `algo/kruskal.html` | `algo` | `algo-kruskal` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `algo/prim.html` | `algo` | `algo-prim` | A | 是 | 是 | 图算法动画页，SVG 图 + 优先队列可视化 + 3 场景（正常流程/Kruskal对比/不连通图） |
| `algo/knapsack.html` | `algo` | `algo-knapsack` | A | 是 | 是 | 动态规划表格过程动画页 |
| `algo/lcs.html` | `algo` | `algo-lcs` | A | 是 | 是 | LCS 动态规划表格过程动画页 |
| `algo/edit-distance.html` | `algo` | `algo-edit-distance` | A | 是 | 是 | 编辑距离 DP 填表+回溯动画页，3 场景（正常填表/回溯路径/边界情况） |
| `algo/interval-dp.html` | `algo` | `algo-interval-dp` | A | 是 | 是 | 区间 DP 上三角表格动画页，3 场景（矩阵链乘/合并石子/边界初始化） |
| `algo/lis.html` | `algo` | `algo-lis` | A | 是 | 是 | LIS DP / patience sorting 过程动画页 |
| `db/db-architecture.html` | `db` | `db-architecture` | C | 是 | 是 | C 类型系统架构页，覆盖连接层→解析→优化→执行→存储层级走查 |
| `db/query-path.html` | `db` | `query-path` | C | 是 | 是 | C 类型系统流程页，覆盖 SQL 执行全路径各阶段 |
| `db/storage-layout.html` | `db` | `storage-layout` | C | 是 | 是 | C 类型结构走查页，覆盖页格式、堆文件和行列存储 |
| `db/buffer-pool.html` | `db` | `buffer` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `db/wal.html` | `db` | `wal` | C | 是 | 是 | C 类型系统流程页，覆盖正常提交和崩溃恢复双场景 |
| `db/mysql-logs.html` | `db` | `mysql-logs` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `db/btree-index.html` | `db` | `bplus` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `db/hash-index.html` | `db` | `db-hash-index` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `db/query-plan.html` | `db` | `db-query-plan` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `db/join-algo.html` | `db` | `join` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `db/external-sort.html` | `db` | `sort` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `db/mvcc.html` | `db` | `mvcc` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `db/transaction.html` | `db` | `locks` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `db/distributed-db.html` | `db` | `distributed-db` | C | 是 | 是 | C 类型系统流程页，覆盖分片、复制和 CAP 三场景 |
| `db/cache-layers.html` | `db` | `cache-layers` | C | 是 | 是 | C 类型系统架构页，覆盖硬件缓存层级和数据库缓存体系 |
| `db/timeseries.html` | `db` | `db-timeseries` | C | 是 | 否 | C 类型系统流程页，覆盖 TSM 写入路径、Delta-of-Delta 压缩、时间范围分区剪枝、降采样与 OOO 四场景 |
| `db/column-store.html` | `db` | `db-column-store` | C | 是 | 否 | C 类型系统架构页，覆盖行列存 IO 对比、RLE/字典/Delta 列压缩、SIMD 向量化执行、MergeTree 写入合并四场景 |
| `db/graph-db.html` | `db` | `db-graph-db` | C | 是 | 否 | C 类型系统流程页，覆盖存储模型对比、单跳查询、多跳 BFS 与笛卡尔积对比、最短路径四场景 |
| `redis/data-types.html` | `redis` | `redis-types` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `redis/persistence.html` | `redis` | `redis-persistence` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `redis/eviction.html` | `redis` | `redis-eviction` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `redis/cluster.html` | `redis` | `redis-cluster` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `redis/distributed-lock.html` | `redis` | `redis-lock` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `linux/io-models.html` | `linux` | `epoll` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `linux/virtual-memory.html` | `linux` | `vm` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `linux/filesystem.html` | `linux` | `fs` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `linux/scheduling.html` | `linux` | `sched` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `linux/commands.html` | `linux` | `linux-commands` | A | 是 | 是 | 交互式命令参考页，步进浏览 6 类 24 个常用命令 |
| `linux/process-lifecycle.html` | `linux` | `linux-process` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `network/tcp-handshake.html` | `network` | `tcp` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `network/tcp-congestion.html` | `network` | `congestion` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `network/http.html` | `network` | `http` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `network/dns.html` | `network` | `dns` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `network/load-balancing.html` | `network` | `lb` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `kafka/kafka-overview.html` | `kafka` | `kafka-overview` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `kafka/producer.html` | `kafka` | `kafka-producer` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `kafka/consumer.html` | `kafka` | `kafka-consumer` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `kafka/partition-replication.html` | `kafka` | `kafka-replica` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `kafka/consumer-group.html` | `kafka` | `kafka-group` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `cs/cpu.html` | `cs` | `cpu-pipeline` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `cs/cache.html` | `cs` | `cache-hierarchy` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `cs/memory.html` | `cs` | `memory-addressing` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `cs/io.html` | `cs` | `io-bus` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `cs/number.html` | `cs` | `number-repr` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `cs/barrier.html` | `cs` | `cs-barrier` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `cs/atomic.html` | `cs` | `cs-atomic` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `golang/type-system.html` | `golang` | `go-syntax` | B | 否 | 是 | 文字 / 概念说明页 |
| `golang/string.html` | `golang` | `go-string` | B | 否 | 是 | 文字 / 概念说明页 |
| `golang/interface.html` | `golang` | `go-interface` | B | 否 | 是 | 文字 / 概念说明页 |
| `golang/embedding.html` | `golang` | `go-embedding` | B | 否 | 是 | 文字 / 概念说明页 |
| `golang/error.html` | `golang` | `go-error` | B | 否 | 是 | 文字 / 概念说明页 |
| `golang/generics.html` | `golang` | `go-generics` | B | 否 | 是 | 文字 / 概念说明页 |
| `golang/closure.html` | `golang` | `go-closure` | B | 否 | 是 | 文字 / 概念说明页 |
| `golang/defer-panic.html` | `golang` | `go-defer-panic` | B | 否 | 是 | 文字 / 概念说明页 |
| `golang/slice-map.html` | `golang` | `go-slice-map` | B | 否 | 是 | 文字 / 概念说明页 |
| `golang/reflect.html` | `golang` | `go-reflect` | B | 否 | 是 | 文字 / 概念说明页 |
| `golang/gmp.html` | `golang` | `go-runtime` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `golang/gc.html` | `golang` | `go-gc` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `golang/channel.html` | `golang` | `go-channel` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `golang/goroutine.html` | `golang` | `go-concurrency` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `golang/memory-alloc.html` | `golang` | `go-mem-alloc` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `golang/escape.html` | `golang` | `go-escape` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `golang/select.html` | `golang` | `go-select` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `golang/context.html` | `golang` | `go-context` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `golang/timer.html` | `golang` | `go-timer` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `golang/concurrent-patterns.html` | `golang` | `go-patterns` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `golang/memory-model.html` | `golang` | `go-memory` | A | 是 | 是 | 过程 / 代码动画页，保留现有交互结构 |
| `golang/sync.html` | `golang` | `go-sync` | B | 否 | 是 | 文字 / 概念说明页 |
| `golang/atomic.html` | `golang` | `go-atomic` | B | 否 | 是 | 文字 / 概念说明页 |
| `golang/syncpool.html` | `golang` | `go-syncpool` | B | 否 | 是 | 文字 / 概念说明页 |
| `golang/errgroup.html` | `golang` | `go-errgroup` | B | 否 | 是 | 文字 / 概念说明页 |
| `golang/io.html` | `golang` | `go-stdlib` | B | 否 | 是 | 文字 / 概念说明页 |
| `golang/http.html` | `golang` | `go-web` | B | 否 | 是 | 文字 / 概念说明页 |
| `golang/json.html` | `golang` | `go-json` | B | 否 | 是 | 文字 / 概念说明页 |
| `golang/sql.html` | `golang` | `go-sql` | B | 否 | 是 | 文字 / 概念说明页 |
| `golang/strings-bytes.html` | `golang` | `go-strings-bytes` | B | 否 | 是 | 文字 / 概念说明页 |
| `golang/modules.html` | `golang` | `go-modules` | B | 否 | 是 | 文字 / 概念说明页 |
| `golang/testing.html` | `golang` | `go-testing` | B | 否 | 是 | 文字 / 概念说明页 |
| `golang/pprof.html` | `golang` | `go-pprof` | B | 否 | 是 | 文字 / 概念说明页 |
| `golang/patterns.html` | `golang` | `go-architecture` | B | 否 | 是 | 文字 / 概念说明页 |
| `golang/unsafe.html` | `golang` | `go-unsafe` | B | 否 | 是 | 文字 / 概念说明页 |
| `algo/sliding-window.html` | `algo` | `sliding-window` | B | 否 | 否 | 已优化为 B 类型概念说明页 |
| `algo/monotonic.html` | `algo` | `monotonic` | B | 否 | 否 | 已优化为 B 类型概念说明页 |
| `algo/probabilistic-ds.html` | `algo` | `probabilistic-ds` | B | 否 | 否 | 已优化为 B 类型概念说明页 |
| `algo/heavy-hitters.html` | `algo` | `heavy-hitters` | B | 否 | 否 | 已优化为 B 类型概念说明页 |
| `distributed/consistent-hash.html` | `distributed` | `consistent-hash` | C | 是 | 否 | C 类型流程动画页，覆盖 hash ring、虚拟节点、故障接管和局部迁移 |
| `redis/lru-lfu.html` | `redis` | `lru-lfu` | B | 否 | 否 | 已优化为 B 类型概念说明页 |
| `algo/bloom.html` | `algo` | `bloom` | B | 否 | 否 | 已优化为 B 类型概念说明页 |
| `db/lsm.html` | `db` | `lsm` | B | 否 | 否 | 已优化为 B 类型概念说明页 |
| `db/vector.html` | `db` | `vector` | B | 否 | 否 | 已优化为 B 类型概念说明页 |
| `linux/sequential-io.html` | `linux` | `sequential-io` | B | 否 | 否 | 已优化为 B 类型概念说明页 |
| `distributed/paxos.html` | `distributed` | `paxos` | C | 是 | 否 | C 类型协议动画页，覆盖 Prepare / Accept、冲突拒绝和恢复提交 |
| `distributed/raft.html` | `distributed` | `raft` | C | 是 | 否 | C 类型协议动画页，覆盖选举、日志复制、Leader 故障和日志修复 |
| `distributed/cap-theorem.html` | `distributed` | `cap-theorem` | C | 是 | 否 | C 类型系统权衡页，覆盖网络分区、CP / AP 选择和恢复收敛 |
| `linux/zero-copy.html` | `linux` | `zero-copy` | B | 否 | 否 | 已优化为 B 类型概念说明页 |
| `linux/ebpf.html` | `linux` | `ebpf` | B | 否 | 否 | 已优化为 B 类型概念说明页 |
| `linux/cgroup.html` | `linux` | `cgroup` | B | 否 | 否 | 已优化为 B 类型概念说明页 |
| `network/quic.html` | `network` | `quic` | C | 是 | 否 | C 类型协议动画页，覆盖握手、独立流、丢包、0-RTT 边界和连接迁移 |
| `kafka/kraft.html` | `kafka` | `kraft` | C | 是 | 否 | C 类型协议动画页，覆盖 controller quorum、metadata log、故障选主和 Broker 追平 |
| `kafka/exactly-once.html` | `kafka` | `exactly-once` | C | 是 | 否 | C 类型系统流程页，覆盖幂等生产、事务提交、失败回滚和恢复重试 |
| `ai/llm-overview.html` | `ai` | `ai-llm-overview` | B | 否 | 是 | B 类型概念说明页，覆盖 Token、Embedding、训练阶段、上下文窗口和对齐 |
| `ai/transformer-attention.html` | `ai` | `ai-attention` | A | 是 | 是 | A 类型过程 / 代码动画页，覆盖 Q/K/V、Mask、Softmax、加权求和和 Multi-Head |
| `ai/inference-kv-cache.html` | `ai` | `ai-kv-cache` | C | 是 | 是 | C 类型系统流程页，覆盖 Tokenize、Prefill、KV Cache、Decode、Sampling 和 Streaming |
| `ai/rag-pipeline.html` | `ai` | `ai-rag` | C | 是 | 是 | C 类型系统流程页，覆盖 Chunk、Embedding、向量索引、召回、Rerank、Prompt 组装和生成 |
| `ai/agent-tool-calling.html` | `ai` | `ai-agent` | C | 是 | 是 | C 类型系统流程页，覆盖 Planner、Tool Call、Observation、Memory、Guardrail 和停止条件 |
| `ai/training-pipeline.html` | `ai` | `ai-training` | C | 是 | 是 | C 类型系统流程页，覆盖 Dataset、Batch、Forward、Loss、Backward、Optimizer 和 Checkpoint |
| `ai/mixture-of-experts.html` | `ai` | `ai-moe` | C | 是 | 是 | C 类型系统流程页，覆盖 Router、Top-k Experts、容量限制和负载均衡 |
| `ai/eval-deploy.html` | `ai` | `ai-eval-deploy` | B | 否 | 是 | B 类型工程说明页，覆盖评测集、灰度、观测、成本、延迟和回滚 |
| `system-design/short-url.html` | `system-design` | `sd-short-url` | C | 是 | 否 | C 类型系统流程页，覆盖 URL 哈希、Base62、Redis 缓存、302 重定向和缓存穿透防护 |
| `system-design/rate-limiter.html` | `system-design` | `sd-rate-limiter` | C | 是 | 否 | C 类型系统流程页，覆盖令牌桶、滑动窗口算法演示和分布式限流（Redis Lua）方案 |
| `system-design/distributed-id.html` | `system-design` | `sd-distributed-id` | C | 是 | 否 | C 类型系统流程页，覆盖 Snowflake 位布局、时钟回拨处理和 Leaf 号段模式 |
| `system-design/push-system.html` | `system-design` | `sd-push-system` | C | 是 | 否 | C 类型系统流程页，覆盖长连接管理、Kafka 分发、扇出写/扇出读选择、ACK 和断线重连 |
| `system-design/flash-sale.html` | `system-design` | `sd-flash-sale` | C | 是 | 否 | C 类型系统流程页，覆盖流量漏斗、Redis 预扣库存、Kafka 异步下单、超卖防护和降级兜底 |
| `network/tls.html` | `network` | `tls` | C | 是 | 否 | C 类型协议动画页，覆盖 TLS 1.3 握手、证书链验证、前向安全 ECDHE 和 0-RTT 会话复用 |
| `network/websocket.html` | `network` | `websocket` | C | 是 | 否 | C 类型协议动画页，覆盖 HTTP Upgrade 握手、帧格式、心跳 Ping/Pong 和断线重连流程 |
| `network/grpc.html` | `network` | `grpc` | C | 是 | 否 | C 类型系统流程页，覆盖 Protobuf 序列化、HTTP/2 多路复用和四种流 RPC 模式 |
| `network/http2.html` | `network` | `http2` | B | 否 | 否 | B 类型概念说明页，覆盖二进制帧、多路复用、HPACK 头部压缩和服务器推送与 HTTP/1.1 对比 |
| `distributed/2pc.html` | `distributed` | `dist-2pc` | C | 是 | 否 | C 类型协议动画页，覆盖 Prepare/Commit 两阶段、协调者故障、参与者阻塞和悬挂处理 |
| `distributed/saga.html` | `distributed` | `saga` | C | 是 | 否 | C 类型系统流程页，覆盖事务补偿、编排式和协同式 Saga 流程动画 |
| `distributed/zookeeper.html` | `distributed` | `zookeeper` | C | 是 | 否 | C 类型协议动画页，覆盖 ZAB 协议、Leader 选举、Watch 通知和 znode 操作 |
| `distributed/gossip.html` | `distributed` | `gossip` | C | 是 | 否 | C 类型系统流程页，覆盖 Push/Pull/Push-Pull 三种传播模型和收敛过程 |
| `distributed/crdt.html` | `distributed` | `crdt` | B | 否 | 否 | B 类型概念说明页，覆盖 G-Counter、LWW、OR-Set 等无冲突数据类型原理 |
| `distributed/base.html` | `distributed` | `base-theory` | B | 否 | 否 | B 类型概念说明页，覆盖 BASE vs ACID 对比和最终一致性的实现路径 |
| `system-design/feed-system.html` | `system-design` | `sd-feed-system` | C | 是 | 否 | C 类型系统流程页，覆盖推模式/拉模式/混合扇出策略和 Timeline 存储方案 |
| `system-design/chat-system.html` | `system-design` | `sd-chat-system` | C | 是 | 否 | C 类型系统流程页，覆盖 WebSocket 长连接管理、消息顺序、收件箱和离线推送 |
| `system-design/search-suggest.html` | `system-design` | `sd-search-suggest` | C | 是 | 否 | C 类型系统流程页，覆盖前缀 Trie/Redis sorted set、候选词排分和实时热词聚合 |
| `system-design/object-storage.html` | `system-design` | `sd-object-storage` | C | 是 | 否 | C 类型系统流程页，覆盖分块上传、纠删码副本策略、元数据分离和 GC 机制 |
| `system-design/task-scheduler.html` | `system-design` | `sd-task-scheduler` | C | 是 | 否 | C 类型系统流程页，覆盖时间轮 O(1) 触发、分布式分片和幂等执行保证 |
| `system-design/geo-service.html` | `system-design` | `sd-geo-service` | C | 是 | 否 | C 类型系统流程页，覆盖 GeoHash 编码、附近的人查询和四叉树空间索引 |
| `algo/red-black-tree.html` | `algo` | `algo-rbt` | A | 是 | 否 | A 类型过程/代码动画页，覆盖红黑树插入旋转着色和删除修复过程 |
| `algo/fenwick-tree.html` | `algo` | `algo-bit` | A | 是 | 否 | A 类型过程/代码动画页，覆盖树状数组 lowbit 前缀和更新和查询过程 |
| `algo/floyd-warshall.html` | `algo` | `algo-floyd` | A | 是 | 否 | A 类型过程/代码动画页，覆盖全源最短路 DP 表格填充和负权环检测 |
| `algo/backtracking.html` | `algo` | `algo-backtracking` | B | 否 | 否 | B 类型概念说明页，覆盖回溯模板、剪枝策略和组合/排列/子集经典题型 |
| `algo/greedy.html` | `algo` | `algo-greedy` | B | 否 | 否 | B 类型概念说明页，覆盖贪心选择性质、最优子结构和活动选择/霍夫曼编码案例 |
| `algo/aho-corasick.html` | `algo` | `algo-ac` | A | 是 | 否 | A 类型过程/代码动画页，覆盖 AC 自动机 goto/fail 构建和多模式匹配过程 |
| `ai/fine-tuning.html` | `ai` | `ai-fine-tuning` | C | 是 | 是 | C 类型系统流程页，覆盖 SFT 指令对齐、LoRA 低秩分解和参数高效微调流程 |
| `ai/rlhf.html` | `ai` | `ai-rlhf` | C | 是 | 是 | C 类型系统流程页，覆盖奖励模型训练、PPO 策略更新和人类反馈对齐过程 |
| `ai/quantization.html` | `ai` | `ai-quantization` | B | 否 | 是 | B 类型概念说明页，覆盖 INT8/INT4 量化方案、AWQ/GPTQ 和精度权衡 |
| `ai/diffusion.html` | `ai` | `ai-diffusion` | C | 是 | 是 | C 类型系统流程页，覆盖前向加噪、逆向去噪和 DDPM 采样步骤动画 |
| `ai/embedding.html` | `ai` | `ai-embedding` | B | 否 | 是 | B 类型概念说明页，覆盖对比学习、文本向量化原理和语义检索应用场景 |
| `ai/prompt-engineering.html` | `ai` | `ai-prompt-eng` | B | 否 | 是 | B 类型概念说明页，覆盖 CoT、Few-shot、RAG vs Fine-tuning 选择策略 |
| `linux/ipc.html` | `linux` | `linux-ipc` | C | 是 | 否 | C 类型系统流程页，覆盖管道/信号量/共享内存/消息队列对比流程和性能权衡 |
| `linux/signal.html` | `linux` | `linux-signal` | A | 是 | 否 | A 类型过程/代码动画页，覆盖信号产生→传递→处理状态机和 Go 信号处理代码 |
| `linux/network-stack.html` | `linux` | `linux-netstack` | C | 是 | 否 | C 类型系统流程页，覆盖 socket→sk_buff→网卡 DMA 的内核收发包完整路径 |
| `db/replication.html` | `db` | `db-replication` | C | 是 | 否 | C 类型系统流程页，覆盖 Binlog 格式、GTID、半同步复制和复制延迟处理 |
| `db/explain.html` | `db` | `db-explain` | B | 否 | 否 | B 类型概念说明页，覆盖 EXPLAIN 字段解读、执行计划分析和 SQL 优化实践 |
| `db/connection-pool.html` | `db` | `db-conn-pool` | B | 否 | 否 | B 类型概念说明页，覆盖连接池设计原理、最大连接数配置和超时/泄漏检测 |
| `redis/redis-stream.html` | `redis` | `redis-stream` | C | 是 | 否 | C 类型动画页，Stream 日志带+ConsumerGroup 游标+PEL 待确认列表，XADD/XREADGROUP/XACK 全流程 |
| `redis/pipeline.html` | `redis` | `redis-pipeline` | C | 是 | 否 | C 类型动画页，时间线对比逐条 vs Pipeline 模式，灰色 RTT 等待段可视化 |
| `redis/pubsub.html` | `redis` | `redis-pubsub` | B | 否 | 是 | B 类型概念页，频道发布订阅、模式匹配 PSUBSCRIBE、与 Stream 消费语义对比 |
| `distributed/vector-clock.html` | `distributed` | `dist-vector-clock` | C | 是 | 否 | C 类型动画页，三节点向量数组 max 合并，并发事件无法比较大小的可视化 |
| `distributed/service-discovery.html` | `distributed` | `dist-service-discovery` | C | 是 | 否 | C 类型动画页，心跳计时器驱动健康检查、Registry 更新、Client 缓存最终一致同步 |
| `distributed/distributed-tracing.html` | `distributed` | `dist-tracing` | C | 是 | 否 | C 类型动画页，traceparent 跨服务传播、Span 嵌套瀑布图、OTLP 批量上报 Collector |
| `system-design/api-gateway.html` | `system-design` | `sd-api-gateway` | C | 是 | 否 | C 类型动画页，请求球依次通过认证/限流/路由/熔断，每层独立状态和返回码可见 |
| `system-design/notification-system.html` | `system-design` | `sd-notification` | C | 是 | 否 | C 类型动画页，优先级队列多渠道并行、失败重试倒计时、幂等 key 防重投递 |
| `system-design/web-crawler.html` | `system-design` | `sd-webcrawler` | C | 是 | 否 | C 类型动画页，BFS 扩展 URL 层、Bloom Filter 位数组判重、robots.txt 过滤 |
| `system-design/video-streaming.html` | `system-design` | `sd-video` | C | 是 | 否 | C 类型动画页，分片并行转码多分辨率、ABR 自适应切换带宽图、CDN 分发路径 |
| `system-design/payment-system.html` | `system-design` | `sd-payment` | C | 是 | 否 | C 类型动画页，两阶段预扣确认状态机、幂等键防重复、对账任务补偿回滚 |
| `system-design/metrics-monitoring.html` | `system-design` | `sd-monitoring` | C | 是 | 否 | C 类型动画页，TSDB 列存时序块、多指标采集、Alertmanager 聚合抑制告警 |
| `ai/tokenization.html` | `ai` | `ai-tokenization` | C | 是 | 否 | C 类型动画页，BPE 频次统计→合并迭代→词表构建，字符格颜色变化标记新 token |
| `ai/llm-serving.html` | `ai` | `ai-llm-serving` | C | 是 | 否 | C 类型动画页，PagedAttention 分页显存网格、连续批处理多请求并行 decode |
| `ai/multimodal.html` | `ai` | `ai-multimodal` | B | 否 | 是 | B 类型概念页，CLIP 对比预训练、ViT patch 编码、跨模态注意力和多模态幻觉 |
| `ai/context-length.html` | `ai` | `ai-context-length` | B | 否 | 是 | B 类型概念页，RoPE 外推/YaRN、KV Cache GQA 压缩、Lost in the Middle 和 FlashAttention |
| `network/cdn.html` | `network` | `network-cdn` | C | 是 | 否 | C 类型动画页，地图 PoP 就近路由、TTL 命中/回源延迟对比、GSLB 智能调度 |
| `network/nat.html` | `network` | `network-nat` | B | 否 | 是 | B 类型概念页，SNAT/DNAT 机制、NAT 类型与穿透难度、STUN/TURN/ICE 协议栈 |
| `network/bgp.html` | `network` | `network-bgp` | B | 否 | 否 | B 类型概念页，AS/eBGP/iBGP、路径属性选择、路由劫持安全和 RPKI 防御 |
| `linux/container.html` | `linux` | `linux-container` | C | 是 | 否 | C 类型动画页，宿主机剖面 Namespace+Cgroup+OverlayFS 三层隔离，CoW 写时复制 |
| `linux/perf-tools.html` | `linux` | `linux-perf` | B | 否 | 是 | B 类型概念页，USE 方法论 + perf/eBPF/bpftrace/火焰图工具体系 |
| `linux/systemd.html` | `linux` | `linux-systemd` | B | 否 | 是 | B 类型概念页，Unit 文件结构、依赖图、socket activation 和 cgroup 集成 |
| `db/sharding.html` | `db` | `db-sharding` | C | 是 | 否 | C 类型动画页，哈希路由单 Shard、scatter-gather 跨 Shard 聚合、在线再平衡双写迁移 |
| `db/full-text-search.html` | `db` | `db-fulltext` | C | 是 | 否 | C 类型动画页，倒排索引 posting list 构建、双指针归并交集、BM25 TF-IDF 打分 |
| `cs/branch-prediction.html` | `cs` | `cs-branch` | C | 是 | 否 | C 类型动画页，流水线投机执行、预测失败 flush、两位饱和计数器状态机 |
| `cs/tlb.html` | `cs` | `cs-tlb` | C | 是 | 否 | C 类型动画页，VPN+Offset 拆分、TLB hit 1次 vs miss 四级页表 5次访存对比 |
| `cs/numa.html` | `cs` | `cs-numa` | B | 否 | 是 | B 类型概念页，NUMA 节点访存延迟差异、numactl 绑定、false sharing 隔离 |
| `algo/max-flow.html` | `algo` | `algo-maxflow` | A | 是 | 否 | A 类型动画页，残差图增广路、正向边流量增加时反向边同步变化、最小割可视化 |
| `algo/string-hashing.html` | `algo` | `algo-strhash` | A | 是 | 否 | A 类型动画页，滚动哈希 O(1) 移动窗口、哈希碰撞降级逐字符对比 |
| `algo/bit-manipulation.html` | `algo` | `algo-bitmanip` | B | 否 | 是 | B 类型概念页，AND/OR/XOR/移位操作、Brian Kernighan 算法、状态压缩 DP |
| `algo/two-pointers.html` | `algo` | `algo-twoptr` | B | 否 | 是 | B 类型概念页，对撞/快慢/滑动窗口/归并四种双指针模式 |
| `algo/divide-conquer.html` | `algo` | `algo-dc` | B | 否 | 是 | B 类型概念页，主定理、归并排序逆序对、快速幂、Karatsuba 乘法 |
| `cloud-native/index.html` | `cloud-native` | `cloud-native` | - | 否 | 否 | 模块首页，云原生技术栈入口，含学习路径 |
| `cloud-native/docker.html` | `cloud-native` | `cn-docker` | C | 是 | 否 | C 类型动画页，Dockerfile 指令堆叠只读层、docker run 可写层、CoW 和 docker commit |
| `cloud-native/kubernetes.html` | `cloud-native` | `cn-kubernetes` | C | 是 | 否 | C 类型动画页，kubectl apply 流经 API Server/etcd/Controller/Scheduler/kubelet 完整管道 |
| `cloud-native/k8s-scheduling.html` | `cloud-native` | `cn-scheduling` | C | 是 | 否 | C 类型动画页，Filter 淘汰不满足节点（显示原因）、Score 多插件加权打分、Bind |
| `cloud-native/k8s-networking.html` | `cloud-native` | `cn-networking` | C | 是 | 否 | C 类型动画页，Pod→veth→cbr0→iptables DNAT→VXLAN→目标 Pod 网络包路径 |
| `cloud-native/k8s-hpa.html` | `cloud-native` | `cn-hpa` | C | 是 | 否 | C 类型动画页，CPU 指标折线、desiredReplicas 公式计算、Pod 阶梯增减和冷却倒计时 |
| `cloud-native/serverless.html` | `cloud-native` | `cn-serverless` | C | 是 | 否 | C 类型动画页，冷启动分段耗时、scale-to-zero、并发扩容、事件驱动 |
| `cloud-native/gitops.html` | `cloud-native` | `cn-gitops` | C | 是 | 否 | C 类型动画页，4 场景：正常同步、Drift 检测、回滚、多环境管理，Git/ArgoCD/K8s 三列可视化 |
| `observability/index.html` | `observability` | `observability` | - | 否 | 否 | 模块首页，可观测性三大支柱入口，含学习路径 |
| `observability/prometheus.html` | `observability` | `obs-prometheus` | C | 是 | 否 | C 类型动画页，15s Scrape 拉取、TSDB 内存块压缩到磁盘、Alertmanager 规则评估 |
| `observability/tracing.html` | `observability` | `obs-tracing` | C | 是 | 否 | C 类型动画页，traceparent 跨服务传播、子 Span 创建、OTLP 批量上报瀑布图 |
| `observability/slo.html` | `observability` | `obs-slo` | C | 是 | 否 | C 类型动画页，Error Budget 月燃尽图、告警事件陡降、Budget 耗尽冻结发布按钮 |
| `observability/logging.html` | `observability` | `obs-logging` | C | 是 | 否 | C 类型动画页，4 场景：ELK 写入与检索（倒排索引可视化）、Loki 架构流程（标签路由+Chunk 压缩）、Agent 崩溃从 checkpoint 恢复、日志洪峰背压与级别过滤 |
| `security/index.html` | `security` | `security` | - | 否 | 否 | 模块首页，安全基础四主题入口，含学习路径 |
| `security/crypto.html` | `security` | `sec-crypto` | C | 是 | 否 | C 类型动画页，AES-CBC 链式加密可视化、RSA 加密/签名方向区分 |
| `security/oauth.html` | `security` | `sec-oauth` | C | 是 | 否 | C 类型动画页，四角色泳道图消息流动、Code 一次性变灰、Token 过期倒计时 |
| `security/web-attacks.html` | `security` | `sec-web-attacks` | C | 是 | 否 | C 类型动画页，SQL 注入代码/数据颜色区分、XSS 脚本注入、CSRF Cookie 跨站 |
| `security/jwt.html` | `security` | `sec-jwt` | C | 是 | 否 | C 类型动画页，三段 Base64 解码结构展示、HMAC-SHA256 签名验证、alg:none 漏洞 |
| `security/secrets.html` | `security` | `sec-secrets` | C | 是 | 否 | C 类型动画页，4 Tab 场景：静态凭据风险链、Vault 动态凭据泳道图（TTL 倒计时圆环）、凭据自动轮换时间线、泄漏应急响应级联吊销 |
| `security/zero-trust.html` | `security` | `sec-zero-trust` | C | 是 | 否 | C 类型动画页，4 Tab 场景：传统边界缺陷（同心圆攻击演示）、零信任验证链（IAP 三关卡）、mTLS 服务双向认证（证书流动）、异常访问阻断（Impossible Travel 告警）|
| `network/ip.html` | `network` | `network-ip` | C | 是 | 否 | C 类型动画页，4 Tab：ARP 同子网广播/单播回复/缓存、跨子网 3 跳路由 MAC 重封、TTL 递减 Traceroute 路径探测、CIDR /24 拆分 /25 广播域隔离 |
| `network/vxlan.html` | `network` | `network-vxlan` | C | 是 | 否 | C 类型动画页，4 Tab：跨主机 Pod VXLAN 封包/解包、EVPN BGP 分发 MAC-IP 消除泛洪、VNI 租户隔离、VTEP 故障 EVPN 路由撤回流量切换 |
| `distributed/lease.html` | `distributed` | `dist-lease` | C | 是 | 否 | C 类型动画页，4 Tab：正常心跳续约 TTL 倒计时重置、崩溃后 TTL 归零自动释放、Fencing Token 防脑裂旧 Leader 写入被拒、惊群效应随机抖动错峰 |
| `distributed/quorum.html` | `distributed` | `dist-quorum` | C | 是 | 否 | C 类型动画页，4 Tab：W=2/R=2/N=3 写 2 副本 ACK、W+R>N 保证读到最新值、Read Repair 异步修复落后副本、W+R=N 脏读风险演示 |
| `linux/io-uring.html` | `linux` | `linux-io-uring` | C | 是 | 否 | C 类型动画页，4 Tab：epoll 每个 I/O 一次 syscall 基准、SQ/CQ 双环批量提交一次 syscall、注册固定缓冲区 DMA 直写、SQE 独立失败不影响其他请求 |
| `linux/dpdk.html` | `linux` | `linux-dpdk` | B | 否 | 是 | B 类型概念页，PMD 轮询绕过中断、HugePage 减少 TLB miss、CPU 绑核 NUMA 感知、mbuf 零拷贝、内核栈 vs DPDK 对比表、工程场景和误区 |
| `ai/guardrails.html` | `ai` | `ai-guardrails` | B | 否 | 是 | B 类型概念页，Prompt Injection/越狱攻击模式、多层护栏（输入过滤+Prompt 加固+输出检测+审计）、Llama Guard 等护栏框架 |
| `ai/inference-optimization.html` | `ai` | `ai-inference-opt` | C | 是 | 是 | C 类型系统流程页，FlashAttention IO 感知分块、Speculative Decoding 草稿验证加速、PagedAttention 分页显存管理、Continuous Batching |
| `ai/structured-output.html` | `ai` | `ai-structured-output` | B | 否 | 是 | B 类型概念页，JSON mode 强制输出有效 JSON、Function Calling 结构化调用、Constrained Decoding token 约束、Schema 校验和工程实践 |
| `cloud-native/helm.html` | `cloud-native` | `cn-helm` | B | 否 | 否 | B 类型概念页，Chart 目录结构、values.yaml 参数化模板、Release 生命周期管理、Helm Hook 顺序控制、升级和回滚策略 |
| `cloud-native/k8s-storage.html` | `cloud-native` | `cn-storage` | C | 是 | 否 | C 类型动画页，StorageClass→CSI Driver 动态 PV 供给、PVC 申请绑定生命周期、Pod 重调度数据持久、在线扩容流程 |
| `cloud-native/operator.html` | `cloud-native` | `cn-operator` | C | 是 | 否 | C 类型动画页，CRD 描述期望状态、Controller Reconcile 循环将实际状态收敛到期望、状态机转换和错误重试 |
| `cloud-native/service-mesh.html` | `cloud-native` | `cn-service-mesh` | C | 是 | 否 | C 类型动画页，Sidecar 代理拦截流量、Istiod 通过 xDS 下发路由/限流/熔断/mTLS 策略、流量治理和可观测性集成 |
| `golang/build.html` | `golang` | `go-build` | B | 否 | 是 | B 类型概念页，build tag 条件编译、GOOS/GOARCH 交叉编译、go:generate 代码生成、内容寻址 build cache、go work 多模块工作区 |
| `golang/cgo.html` | `golang` | `go-cgo` | B | 否 | 是 | B 类型概念页，Go 调 C 需切换到 OS 线程约 100ns 开销、阻塞 C 调用触发新 M、内存管理边界、不支持交叉编译和工程建议 |
| `observability/chaos.html` | `observability` | `obs-chaos` | C | 是 | 否 | C 类型动画页，稳态假说→故障注入→观测偏差→修复循环、Chaos Mesh Pod Kill/网络延迟/分区注入、实验范围控制和回滚 |
| `observability/grafana.html` | `observability` | `obs-grafana` | B | 否 | 否 | B 类型概念页，Dashboard USE/RED 分层设计、Alertmanager 路由/分组/抑制/静默、告警信噪比优化和 SLO 联动 |
| `observability/opentelemetry.html` | `observability` | `obs-otel` | C | 是 | 否 | C 类型动画页，统一 SDK 采集 Trace/Metric/Log、Collector Pipeline 批量处理、Tail Sampling 按完整 Trace 决策、多 Exporter 扇出 |
| `security/container-security.html` | `security` | `sec-container` | B | 否 | 否 | B 类型概念页，镜像 CVE 扫描（Trivy）、securityContext 权限限制、Seccomp/AppArmor syscall 过滤、K8s RBAC 最小权限原则 |
| `security/pki.html` | `security` | `sec-pki` | C | 是 | 否 | C 类型动画页，CA 层级签发证书链、浏览器从叶证书向上验证到根 CA、ACME 自动续签流程、OCSP 吊销检查和 mTLS 双向认证 |
| `security/supply-chain.html` | `security` | `sec-supply-chain` | B | 否 | 否 | B 类型概念页，SBOM 软件物料清单、Cosign 对镜像摘要签名、K8s Admission Webhook 强制验签、依赖审计和真实攻击案例 |
| `system-design/config-center.html` | `system-design` | `sd-config-center` | C | 是 | 否 | C 类型动画页，集中管理配置、Long Poll 推送变更、服务热更新不重启、灰度推送按实例分批、宕机时降级读本地缓存 |
| `system-design/multi-region.html` | `system-design` | `sd-multi-region` | C | 是 | 否 | C 类型动画页，GSLB 就近路由双 Region、CDC 跨区同步延迟窗口、故障切换 RTO/RPO 保障、仲裁节点防脑裂 |
| `ai/speculative-decoding.html` | `ai` | `ai-spec-decode` | C | 是 | 是 | C 类型动画页，4 场景：正常接受/部分拒绝/草稿崩溃/与自回归对比，Draft Model 生成+Target Model 并行验证流程 |
| `ai/llm-reasoning.html` | `ai` | `ai-llm-reasoning` | C | 是 | 是 | C 类型动画页，4 场景：Zero-shot CoT/Few-shot CoT/Tree of Thought 搜索树/ReAct 工具调用循环 |
| `ai/model-merging.html` | `ai` | `ai-model-merging` | B | 否 | 是 | B 类型概念页，SLERP 球形插值、Task Arithmetic 向量加减、TIES/DARE 稀疏化冲突参数，无需重训练组合能力 |
| `algo/suffix-array.html` | `algo` | `algo-suffix-array` | A | 是 | 是 | A 类型动画页，3 场景：SA-IS 构建后缀数组/LCP 数组计算/子串二分查找 |
| `algo/tarjan-scc.html` | `algo` | `algo-tarjan-scc` | A | 是 | 是 | A 类型动画页，3 场景：正常 SCC 识别/单节点 SCC/复杂环形图 |
| `algo/bipartite-matching.html` | `algo` | `algo-bipartite` | A | 是 | 是 | A 类型动画页，3 场景：完美匹配增广路/部分匹配/无增广路失败，匈牙利算法过程 |
| `algo/hld.html` | `algo` | `algo-hld` | A | 是 | 是 | A 类型动画页，3 场景：构建重链/路径查询/子树更新，树链剖分配合线段树完整过程 |
| `system-design/recommendation.html` | `system-design` | `sd-recommendation` | C | 是 | 否 | C 类型动画页，4 场景：协同过滤/双塔向量召回/粗排精排漏斗/实时特征反馈闭环 |
| `system-design/live-streaming.html` | `system-design` | `sd-live-streaming` | C | 是 | 否 | C 类型动画页，4 场景：RTMP 推流/多分辨率转码/CDN 拉流/弹幕 WebSocket 同步 |
| `system-design/search-engine.html` | `system-design` | `sd-search-engine` | C | 是 | 否 | C 类型动画页，4 场景：爬取索引构建/倒排合并/BM25 查询打分/PageRank 链接分析 |
| `distributed/3pc.html` | `distributed` | `dist-3pc` | C | 是 | 否 | C 类型动画页，4 场景：正常三阶段提交/协调者故障参与者超时自提交/参与者超时处理/与 2PC 对比 |
| `distributed/spanner.html` | `distributed` | `dist-spanner` | B | 否 | 是 | B 类型概念页，TrueTime API 有界误差时间戳、commit-wait 外部一致性、Paxos 分组架构、全球强一致事务 |
| `golang/performance-tuning.html` | `golang` | `go-perf-tuning` | B | 否 | 是 | B 类型概念页，CPU 火焰图→内存分配→goroutine 泄漏→mutex 竞争，pprof/trace/benchstat 工具链调优方法论 |
| `golang/go-assembly.html` | `golang` | `go-assembly` | B | 否 | 是 | B 类型概念页，Plan 9 汇编语法、寄存器传参 ABI、栈帧结构、伪寄存器 FP/SP/PC/SB，理解编译器输出 |
| `cs/gpu-architecture.html` | `cs` | `cs-gpu-arch` | C | 是 | 是 | C 类型动画页，4 场景：SIMT 并行/Warp 分叉效率下降/HBM 显存带宽瓶颈/CPU-GPU PCIe 流水线传输 |
| `db/nosql.html` | `db` | `db-nosql` | B | 否 | 否 | B 类型概念页，文档/宽列/KV/图四类 NoSQL 数据模型、CAP 定位、典型系统选型矩阵和工程误区 |
| `testing/index.html` | `testing` | `testing` | - | 否 | 否 | 模块首页，含测试六主题学习路径卡片和专题分组，B 类型徽标标注各页面类型 |
| `testing/test-pyramid.html` | `testing` | `test-pyramid` | B | 否 | 否 | B 类型概念页，单元/集成/E2E 三层金字塔策略、覆盖率意义与误区、冰淇淋甜筒反模式、分布式系统测试边界调整 |
| `testing/mock-stub.html` | `testing` | `test-mock` | B | 否 | 否 | B 类型概念页，Test Doubles 五种类型对比、接口驱动 Mock 设计、gomock 代码生成与使用、testify/mock 手写 Mock、过度 Mock 反模式 |
| `testing/load-testing.html` | `testing` | `test-load` | C | 是 | 否 | C 类型动画页，4 场景：正常负载基线/压力峰值断裂点/线程池耗尽队列积压/限流触发保护服务，含 P50/P99 延迟百分位柱状图和指标监控面板 |
| `testing/contract-testing.html` | `testing` | `test-contract` | B | 否 | 否 | B 类型概念页，Consumer-Driven Contract 原理、Pact 框架 Consumer 侧定义与 Provider 侧验证代码示例、CI/CD 集成工作流、与集成测试对比和局限性 |
| `testing/fuzz-testing.html` | `testing` | `test-fuzz` | B | 否 | 否 | B 类型概念页，Coverage-guided fuzzing 循环机制、Go 原生 go test -fuzz 语法、Seed Corpus 管理、往返测试和 Parser 安全验证示例、适用场景矩阵 |
| `testing/tdd.html` | `testing` | `test-tdd` | B | 否 | 否 | B 类型概念页，Red-Green-Refactor 三步循环、FizzBuzz TDD 完整示例、测试先行如何驱动接口设计、BDD Given/When/Then 语言、Ginkgo 框架示例和工程权衡矩阵 |

新增页面登记规则：

- 如果页面是算法过程、数据结构操作、代码和动画强绑定，登记为 A。
- 如果页面以概念说明和代码解释为主，没有完整动画，登记为 B。
- 如果页面以概念 / 协议 / 系统流程解释为主，并带完整动画，登记为 C。
- 如果页面类型变化，例如 B 升级为 C，必须同步修改本表。

## 面包屑与返回规则

- 所有页面都应加载 `nav.js`，复用统一面包屑。
- 页面内不要重复实现一套与 `nav.js` 冲突的面包屑逻辑。
- 从星图进入页面后，本地返回入口应回到星图。
- 普通进入页面时，返回入口应回到所属 module 首页。
- 新增页面后需要检查：模块首页进入、星图进入、浏览器返回、页面内返回按钮四种路径。

## PC-only 页面策略

- 以桌面宽屏为主要目标，优先保证 1280px 及以上宽度体验。
- A 类型和 C 类型可以使用三栏、宽画布、右侧步骤面板等 PC 友好布局。
- 不再为了手机端隐藏关键内容或压缩交互。
- 可以保留基础 CSS 防止极端溢出，但不要为了移动端牺牲 PC 的信息密度。

## 实现前思考清单

新增内容前先回答这些问题：

- 这个主题属于哪个 module？是否需要新增 module？
- 它和已有哪些 node 有强关系？这些关系为什么成立？
- 页面是 A、B 还是 C？是否真的需要动画？
- 如果需要动画，完整流程和边界情况有哪些？
- 如果是概念页，第一次接触的人读完能不能讲清楚它是什么、为什么存在、怎么工作？
- 是否需要代码区？代码是否和文字、动画步骤对应？
- `graph.html` / `architecture.html` hover 文案是否足够解释清楚？
- 入口、返回、面包屑、星图跳转、登记表是否都同步了？

## 验证清单

每次新增或修改 module / node / 三级页面后，至少验证：

- 页面在 PC 浏览器中布局正常，没有横向错位、遮挡、内容溢出。
- 星图中可以搜索、筛选、hover、选中、打开新增节点。
- 架构图中新增 module 的位置、连线、hover / 选中说明正常。
- 从星图进入页面后，返回入口能回到星图。
- 从 module 首页进入页面后，返回入口能回到 module 首页。
- 动画页的播放、暂停、上一步、下一步、重置稳定。
- 动画覆盖了正常路径、边界情况和异常或特殊分支。
- 动画 A/C 类型页面已覆盖四类场景：正常路径、边界情况、故障/异常路径、恢复/对比，缺少任何一类须补齐。
- 三级页面登记表已经同步。
- Obsidian Vault 中对应笔记已创建或更新，`[[wiki 链接]]` 指向已存在的笔记，无悬空链接。
