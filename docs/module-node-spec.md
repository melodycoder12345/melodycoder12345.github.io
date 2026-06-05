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
| `algo/knapsack.html` | `algo` | `algo-knapsack` | A | 是 | 是 | 动态规划表格过程动画页 |
| `algo/lcs.html` | `algo` | `algo-lcs` | A | 是 | 是 | LCS 动态规划表格过程动画页 |
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
- 三级页面登记表已经同步。
