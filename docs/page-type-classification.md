# 三级页面分类（基于知识属性）

本文档基于各页面所承载知识的本质属性进行分类判断，不依赖现有实现元素。

## 分类标准

| 类型 | 适用主题 | 核心特征 | 典型场景 |
|------|---------|---------|---------|
| **A** | 算法过程、数据结构操作、有明确代码实现的步骤流程 | 读者需要同时看到"过程变化"和"对应代码" | 排序、搜索、树操作、图算法、DP 表格填充 |
| **B** | 概念解释、语言特性、工程实践、API 用法 | 读者需要完整文字说明 + 代码示例，无需动画 | 语言基础、标准库、设计模式、工具用法 |
| **C** | 分布式协议、系统架构流程、多角色/组件交互 | 读者需要系统级组件交互或状态变迁动画，不依赖具体实现代码 | Raft、Paxos、WAL 流程、集群协议、架构层级走查 |

---

## algo 模块

| 页面 | 类型 | 理由 |
|------|------|------|
| `algo/bubble-sort.html` | A | 数组交换过程 + 排序代码 |
| `algo/selection-sort.html` | A | 选择最小元素过程 + 代码 |
| `algo/insertion-sort.html` | A | 插入移位过程 + 代码 |
| `algo/merge-sort.html` | A | 分治合并过程 + 代码 |
| `algo/quick-sort.html` | A | 分区递归过程 + 代码 |
| `algo/heap-sort.html` | A | 建堆 / 弹出过程 + 代码 |
| `algo/counting-sort.html` | A | 计数数组填充过程 + 代码 |
| `algo/radix-sort.html` | A | 按位分桶过程 + 代码 |
| `algo/topological-sort.html` | A | 入度队列 BFS 过程 + 代码 |
| `algo/binary-search.html` | A | 区间收缩过程 + 代码 |
| `algo/kmp.html` | A | next 数组构建 + 匹配过程 + 代码 |
| `algo/linked-list.html` | A | 指针操作过程 + 代码 |
| `algo/stack.html` | A | 压栈弹栈过程 + 代码 |
| `algo/queue.html` | A | 入队出队过程 + 代码 |
| `algo/heap.html` | A | 上浮下沉过程 + 代码 |
| `algo/hash-table.html` | A | 哈希冲突解决过程 + 代码 |
| `algo/skip-list.html` | A | 多层链表查找/插入过程 + 代码 |
| `algo/binary-search-tree.html` | A | BST 插入/删除/查找 + 代码 |
| `algo/avl-tree.html` | A | 旋转平衡过程 + 代码 |
| `algo/b-tree.html` | A | 节点分裂/合并过程 + 代码 |
| `algo/b-plus-tree.html` | A | 叶子链表 + 分裂过程 + 代码 |
| `algo/trie.html` | A | 前缀插入/查找过程 + 代码 |
| `algo/segment-tree.html` | A | 区间查询/更新过程 + 代码 |
| `algo/tree-traversal.html` | A | 前中后序遍历过程 + 代码 |
| `algo/union-find.html` | A | 路径压缩/按秩合并过程 + 代码 |
| `algo/bfs.html` | A | 队列扩展过程 + 代码 |
| `algo/dfs.html` | A | 递归/栈探索过程 + 代码 |
| `algo/dijkstra.html` | A | 优先队列松弛过程 + 代码 |
| `algo/bellman-ford.html` | A | 逐轮松弛过程 + 代码 |
| `algo/kruskal.html` | A | 边排序 + 并查集合并过程 + 代码 |
| `algo/knapsack.html` | A | DP 表格填充过程 + 代码 |
| `algo/lcs.html` | A | DP 表格填充 + 回溯过程 + 代码 |
| `algo/lis.html` | A | DP/patience sorting 过程 + 代码 |
| `algo/sliding-window.html` | B | 滑动窗口是算法技巧/模板概念，适合文字 + 代码模板说明 |
| `algo/monotonic.html` | B | 单调栈/队列是算法技巧概念，适合模式说明 + 代码模板 |
| `algo/probabilistic-ds.html` | B | 近似数据结构概念总览，适合文字说明 |
| `algo/heavy-hitters.html` | B | Top-K 算法概念对比，适合文字说明 |
| `algo/bloom.html` | B | Bloom Filter 原理说明，适合文字 + 概率分析 |

**小计：A=33, B=5, C=0**

---

## db 模块

| 页面 | 类型 | 理由 |
|------|------|------|
| `db/btree-index.html` | A | B+ 树索引的插入/查找/范围扫描过程 + 代码 |
| `db/hash-index.html` | A | 哈希索引的桶定位/冲突处理过程 + 代码 |
| `db/buffer-pool.html` | A | LRU 页面置换过程 + 代码 |
| `db/external-sort.html` | A | 外部排序归并过程 + 代码 |
| `db/join-algo.html` | A | NLJ/Hash Join/Sort-Merge Join 过程 + 代码 |
| `db/query-plan.html` | A | 火山模型 Next() 调用树过程 + 代码 |
| `db/db-architecture.html` | C | 数据库系统层级（连接层→解析→优化→执行→存储）组件交互流程 |
| `db/query-path.html` | C | SQL 语句穿越多个系统组件的执行路径 |
| `db/storage-layout.html` | C | 表空间→段→区→页→行的存储结构走查 |
| `db/wal.html` | C | WAL 写入→刷盘→崩溃恢复的系统流程 |
| `db/mysql-logs.html` | C | redo/undo/binlog 协调写入的系统流程 |
| `db/mvcc.html` | C | 版本链构建、ReadView 快照读是并发协议流程 |
| `db/transaction.html` | C | 两阶段锁、死锁检测、等待图是系统协议流程 |
| `db/cache-layers.html` | C | 多级缓存体系的系统架构流程 |
| `db/distributed-db.html` | C | 分片/复制/路由的分布式系统交互流程 |
| `db/lsm.html` | B | LSM Tree 分层结构概念说明 |
| `db/vector.html` | B | 向量索引原理概念说明 |

**小计：A=6, B=2, C=9**

---

## redis 模块

| 页面 | 类型 | 理由 |
|------|------|------|
| `redis/data-types.html` | A | 五种数据结构的操作过程 + 命令代码 |
| `redis/persistence.html` | C | RDB 快照/AOF 重写是系统持久化机制流程 |
| `redis/eviction.html` | C | 淘汰策略触发→采样→淘汰是系统行为流程 |
| `redis/cluster.html` | C | 槽分配/Gossip/故障转移是分布式协议流程 |
| `redis/distributed-lock.html` | C | Redlock 多节点加锁/释放是分布式协议流程 |
| `redis/lru-lfu.html` | B | LRU/LFU 算法概念对比说明 |

**小计：A=1, B=1, C=4**

---

## linux 模块

| 页面 | 类型 | 理由 |
|------|------|------|
| `linux/io-models.html` | A | select/poll/epoll 调用过程 + 系统调用代码 |
| `linux/virtual-memory.html` | A | 地址翻译/TLB/缺页中断过程 + 代码 |
| `linux/filesystem.html` | A | VFS 层/inode/block 操作过程 + 系统调用代码 |
| `linux/scheduling.html` | A | CFS 红黑树调度过程 + 代码 |
| `linux/process-lifecycle.html` | A | fork/exec/wait 状态机过程 + 代码 |
| `linux/commands.html` | B | 常用命令参考，文字 + 示例为主 |
| `linux/zero-copy.html` | B | 零拷贝原理概念说明 |
| `linux/ebpf.html` | B | eBPF 架构与用法概念说明 |
| `linux/cgroup.html` | B | cgroup/namespace 概念说明 |
| `linux/sequential-io.html` | B | 顺序 IO/Page Cache 概念说明 |

**小计：A=5, B=5, C=0**

---

## network 模块

| 页面 | 类型 | 理由 |
|------|------|------|
| `network/tcp-handshake.html` | A | 三次握手/四次挥手状态变迁过程 + socket 代码 |
| `network/tcp-congestion.html` | A | 慢启动/拥塞避免/快恢复过程 + 窗口计算代码 |
| `network/http.html` | A | 请求/响应解析过程 + 报文代码 |
| `network/dns.html` | A | 递归/迭代查询过程 + dig 命令代码 |
| `network/load-balancing.html` | A | 轮询/加权/一致性哈希算法过程 + 代码 |
| `network/quic.html` | C | QUIC 握手/独立流/连接迁移是协议交互流程 |

**小计：A=5, B=0, C=1**

---

## kafka 模块

| 页面 | 类型 | 理由 |
|------|------|------|
| `kafka/kafka-overview.html` | A | 生产→Broker→消费架构过程 + 配置代码 |
| `kafka/producer.html` | A | 分区选择/批量发送/ACK 过程 + Producer 代码 |
| `kafka/consumer.html` | A | 拉取/偏移提交/再平衡过程 + Consumer 代码 |
| `kafka/partition-replication.html` | A | ISR 同步/Leader 选举过程 + 配置代码 |
| `kafka/consumer-group.html` | A | Rebalance 协议过程 + 代码 |
| `kafka/kraft.html` | C | Controller Quorum/Metadata Log/故障选主是分布式协议流程 |
| `kafka/exactly-once.html` | C | 幂等生产/事务提交/失败回滚是系统协议流程 |

**小计：A=5, B=0, C=2**

---

## cs 模块

| 页面 | 类型 | 理由 |
|------|------|------|
| `cs/cpu.html` | A | 流水线取指/译码/执行/写回过程 + 指令代码 |
| `cs/cache.html` | A | Cache 命中/未命中/替换过程 + 地址计算代码 |
| `cs/memory.html` | A | 虚拟地址→物理地址翻译过程 + 代码 |
| `cs/io.html` | A | 总线仲裁/DMA 传输过程 + 代码 |
| `cs/number.html` | A | 补码/IEEE 754 转换过程 + 代码 |
| `cs/barrier.html` | A | 内存屏障/指令重排过程 + 汇编代码 |
| `cs/atomic.html` | A | CAS/LL-SC 原子指令执行过程 + 代码 |

**小计：A=7, B=0, C=0**

---

## golang 模块

| 页面 | 类型 | 理由 |
|------|------|------|
| `golang/gmp.html` | A | G-M-P 调度循环/窃取过程 + runtime 代码 |
| `golang/gc.html` | A | 三色标记/写屏障过程 + runtime 代码 |
| `golang/channel.html` | A | 发送/接收/阻塞唤醒过程 + 代码 |
| `golang/goroutine.html` | A | Goroutine 创建/调度/退出过程 + 代码 |
| `golang/memory-alloc.html` | A | mcache→mcentral→mheap 分配过程 + 代码 |
| `golang/escape.html` | A | 逃逸分析决策过程 + 编译器输出代码 |
| `golang/select.html` | A | select case 评估/随机选择过程 + 代码 |
| `golang/context.html` | A | context 树传播/取消过程 + 代码 |
| `golang/timer.html` | A | 四叉堆/调度触发过程 + 代码 |
| `golang/concurrent-patterns.html` | A | pipeline/fan-out/fan-in 过程 + 代码 |
| `golang/memory-model.html` | A | happens-before/可见性过程 + 代码 |
| `golang/type-system.html` | B | 类型系统概念解释 |
| `golang/string.html` | B | 字符串底层结构概念说明 |
| `golang/interface.html` | B | 接口实现/iface 概念说明 |
| `golang/embedding.html` | B | 结构体嵌入概念说明 |
| `golang/error.html` | B | 错误处理模式说明 |
| `golang/generics.html` | B | 泛型用法说明 |
| `golang/closure.html` | B | 闭包捕获机制说明 |
| `golang/defer-panic.html` | B | defer 栈 + panic/recover 说明 |
| `golang/slice-map.html` | B | slice/map 底层结构说明 |
| `golang/reflect.html` | B | 反射 API 用法说明 |
| `golang/sync.html` | B | Mutex/RWMutex/WaitGroup 用法说明 |
| `golang/atomic.html` | B | 原子操作 API 说明 |
| `golang/syncpool.html` | B | sync.Pool 用法说明 |
| `golang/errgroup.html` | B | errgroup 用法说明 |
| `golang/io.html` | B | io.Reader/Writer 接口说明 |
| `golang/http.html` | B | net/http 标准库说明 |
| `golang/json.html` | B | encoding/json 用法说明 |
| `golang/sql.html` | B | database/sql 用法说明 |
| `golang/strings-bytes.html` | B | strings/bytes 包说明 |
| `golang/modules.html` | B | Go Modules 管理说明 |
| `golang/testing.html` | B | 测试框架用法说明 |
| `golang/pprof.html` | B | pprof 性能分析说明 |
| `golang/patterns.html` | B | Go 设计模式说明 |
| `golang/unsafe.html` | B | unsafe 包用法说明 |

**小计：A=11, B=24, C=0**

---

## distributed 模块

| 页面 | 类型 | 理由 |
|------|------|------|
| `distributed/raft.html` | C | 选举/日志复制/Leader 故障是分布式协议流程 |
| `distributed/paxos.html` | C | Prepare/Accept 两阶段是分布式协议流程 |
| `distributed/cap-theorem.html` | C | 网络分区下 CP/AP 权衡是系统行为流程 |
| `distributed/consistent-hash.html` | C | 哈希环/虚拟节点/故障接管是系统流程 |

**小计：A=0, B=0, C=4**

---

## 全局统计

| 模块 | A | B | C | 合计 |
|------|---|---|---|------|
| algo | 33 | 5 | 0 | 38 |
| db | 6 | 2 | 9 | 17 |
| redis | 1 | 1 | 4 | 6 |
| linux | 5 | 5 | 0 | 10 |
| network | 5 | 0 | 1 | 6 |
| kafka | 5 | 0 | 2 | 7 |
| cs | 7 | 0 | 0 | 7 |
| golang | 11 | 24 | 0 | 35 |
| distributed | 0 | 0 | 4 | 4 |
| **总计** | **73** | **37** | **20** | **130** |

不含 index.html / topic.html 等导航页。占比：A 56%, B 28%, C 15%。

---

## 与现有 `module-node-spec.md` 登记表差异

以下页面的知识属性判断与当前 spec 登记表中的分类不一致：

| 页面 | 现有登记 | 建议类型 | 变更原因 |
|------|---------|---------|---------|
| `db/db-architecture.html` | B | **C** | 数据库系统各层级组件交互走查，是系统架构流程而非纯文字概念 |
| `db/query-path.html` | B | **C** | SQL 执行穿越解析器→优化器→执行器→存储引擎，是多组件系统流程 |
| `db/storage-layout.html` | B | **C** | 表空间→段→区→页→行的结构走查，适合结构动画展示 |
| `db/wal.html` | B | **C** | WAL 写入→redo 回放→崩溃恢复，是系统级恢复流程 |
| `db/mysql-logs.html` | A | **C** | redo/undo/binlog 三日志协调写入，是系统组件协作流程而非算法代码 |
| `db/mvcc.html` | A | **C** | 版本链构建、ReadView 生成、快照读，是并发控制协议流程 |
| `db/transaction.html` | A | **C** | 两阶段锁获取/释放、死锁检测、等待图构建，是系统协议流程 |
| `db/cache-layers.html` | B | **C** | 多级缓存（CPU→Buffer Pool→OS Page Cache→磁盘）交互流程 |
| `db/distributed-db.html` | B | **C** | 分片路由、副本同步、跨节点事务，是分布式系统交互流程 |
| `redis/persistence.html` | A | **C** | RDB 快照 fork + AOF 重写 + 混合持久化，是系统机制流程 |
| `redis/eviction.html` | A | **C** | maxmemory 触发→采样→淘汰决策，是系统行为流程 |
| `redis/cluster.html` | A | **C** | 16384 槽分配/Gossip 传播/故障转移投票，是分布式协议流程 |
| `redis/distributed-lock.html` | A | **C** | Redlock 多节点加锁/续约/释放，是分布式协议流程 |
| `linux/commands.html` | B（登记为 B） | **A**（现有实现为 A） | 知识属性上命令参考适合 B 类文字说明，但现有实现采用了 A 类动画结构 |

### 差异总结

- **B → C**（5 处）：`db/db-architecture`、`db/query-path`、`db/storage-layout`、`db/wal`、`db/cache-layers`、`db/distributed-db` — 这些页面虽然当前可能以文字实现，但知识属性上更适合系统流程动画
- **A → C**（7 处）：`db/mysql-logs`、`db/mvcc`、`db/transaction`、`redis/persistence`、`redis/eviction`、`redis/cluster`、`redis/distributed-lock` — 这些页面的核心不是算法代码执行，而是系统/协议级别的组件交互
- **实现与登记不符**（1 处）：`linux/commands.html` 登记为 B 但实际实现为 A

### 备注

- 差异判断基于知识属性本质，不代表现有实现需要立即重构
- 部分 A→C 的页面如果已有良好的代码面板解释，保持 A 类实现也可接受
- 是否同步修改 `module-node-spec.md` 登记表由维护者决定
