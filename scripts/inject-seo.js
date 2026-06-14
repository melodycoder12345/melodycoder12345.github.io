#!/usr/bin/env node
/**
 * inject-seo.js — 批量为所有 HTML 页面注入 SEO meta 标签，并生成 sitemap.xml
 *
 * 用法: node scripts/inject-seo.js
 *
 * 功能:
 * - 为每个 HTML 文件注入 meta description、canonical、Open Graph、Twitter Card
 * - 生成 sitemap.xml（含所有页面）
 * - 幂等：已注入的页面跳过（检测 og:title）
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BASE_URL = 'https://melodycoder12345.github.io';
const SITE_NAME = '码海拾贝';
const TODAY = new Date().toISOString().slice(0, 10);

// ── 所有模块目录 ──────────────────────────────────────────────────────────────
const MODULES = [
  'algo', 'db', 'redis', 'linux', 'network', 'kafka', 'cs',
  'golang', 'distributed', 'ai', 'system-design', 'cloud-native',
  'observability', 'security', 'testing'
];

// ── 从 graph-data.js 提取的节点数据（直接内嵌，不依赖浏览器 runtime）────────
const NODES = [
  {href:'index.html', label:'码海拾贝', desc:'系统设计、算法、Golang、数据库、Redis、Kafka、Linux、分布式等后端工程核心知识的可视化星图与深度笔记。'},
  {href:'algo/index.html', label:'数据结构与算法', desc:'排序、树、图、动态规划与工程常用数据结构。'},
  {href:'db/index.html', label:'数据库原理', desc:'从 SQL 解析到索引、事务、日志、缓存和分布式数据库。'},
  {href:'redis/index.html', label:'Redis 原理', desc:'内存数据结构、持久化、淘汰策略、集群和分布式锁。'},
  {href:'linux/index.html', label:'Linux', desc:'命令、进程、内存、I/O、文件系统和调度器。'},
  {href:'network/index.html', label:'计算机网络', desc:'TCP/IP、HTTP、DNS、TLS、负载均衡和现代 QUIC。'},
  {href:'kafka/index.html', label:'Kafka', desc:'Producer、Consumer、分区副本、消费者组和现代 KRaft 方向。'},
  {href:'cs/index.html', label:'计算机组成原理', desc:'CPU、指令、流水线、缓存层次、内存寻址和 I/O 总线。'},
  {href:'golang/index.html', label:'Golang', desc:'35 个专题：GMP 调度、GC、Channel、逃逸分析、内存模型、并发模式和工程实践。'},
  {href:'distributed/index.html', label:'分布式系统', desc:'CAP、Raft、Paxos、一致性哈希等分布式系统基础概念。'},
  {href:'ai/index.html', label:'AI 系统', desc:'从 LLM 原理、推理、RAG、Agent 到训练、MoE、评测和部署的工程化知识。'},
  {href:'system-design/index.html', label:'系统设计', desc:'短链、限流、分布式 ID、消息推送、秒杀——把算法和中间件组装成真实系统。'},
  {href:'cloud-native/index.html', label:'云原生', desc:'Docker 镜像分层、K8s 控制面、Pod 调度、Service 网络和 HPA 弹性伸缩。'},
  {href:'observability/index.html', label:'可观测性', desc:'Prometheus 指标采集、OpenTelemetry 链路追踪和 SLO Error Budget 管理三大支柱。'},
  {href:'security/index.html', label:'安全基础', desc:'对称非对称加密原理、OAuth 2.0 授权码流程、Web 攻击防御和 JWT 令牌机制。'},
  {href:'system-design/short-url.html', label:'短链系统', desc:'URL 哈希、Base62 编码、数据库持久化、Redis 缓存和 302 重定向的完整链路。'},
  {href:'system-design/rate-limiter.html', label:'限流器', desc:'令牌桶、滑动窗口、分布式限流（Redis Lua）和多级降级策略。'},
  {href:'system-design/distributed-id.html', label:'分布式 ID', desc:'Snowflake 位布局、时钟回拨处理、Leaf 号段模式和多机分配。'},
  {href:'system-design/push-system.html', label:'消息推送系统', desc:'长连接管理、Kafka 消息分发、扇出写/扇出读、ACK 和重试机制。'},
  {href:'system-design/flash-sale.html', label:'秒杀系统', desc:'流量漏斗、Redis 预扣库存、Kafka 异步下单、降级兜底和数据一致性。'},
  {href:'ai/llm-overview.html', label:'LLM 基础概念', desc:'解释 Token、Embedding、预训练、微调、对齐和上下文窗口，是理解 LLM 系统的入口。'},
  {href:'ai/transformer-attention.html', label:'Transformer Attention', desc:'用 Q/K/V、Mask、Softmax 和 Multi-Head 动画理解 Transformer 如何聚合上下文。'},
  {href:'ai/inference-kv-cache.html', label:'推理与 KV Cache', desc:'展示 Tokenize、Prefill、Decode、Sampling 和 Streaming 的在线推理链路。'},
  {href:'ai/rag-pipeline.html', label:'RAG Pipeline', desc:'串起 Chunk、Embedding、向量索引、召回、重排、Prompt 组装和生成。'},
  {href:'ai/agent-tool-calling.html', label:'Agent Tool Calling', desc:'解释 Planner、工具调用、Observation、Memory、Guardrail 和停止条件组成的 Agent 循环。'},
  {href:'ai/training-pipeline.html', label:'Training Pipeline', desc:'展示 Dataset、Tokenize、Batch、Forward、Loss、Backward、Optimizer 和 Checkpoint 的训练主链路。'},
  {href:'ai/mixture-of-experts.html', label:'Mixture of Experts', desc:'用 Router、Top-k Expert、容量限制和负载均衡理解 MoE 稀疏激活架构。'},
  {href:'ai/eval-deploy.html', label:'AI 评测与部署', desc:'讲 Golden Set、灰度、观测、成本、延迟、Prompt 版本和回滚组成的上线闭环。'},
  {href:'algo/bubble-sort.html', label:'冒泡排序', desc:'相邻元素比较交换，适合理解排序稳定性和局部有序。'},
  {href:'algo/selection-sort.html', label:'选择排序', desc:'每轮选择最小元素放到有序区，展示选择型排序思想。'},
  {href:'algo/insertion-sort.html', label:'插入排序', desc:'维护有序前缀，将新元素插入正确位置。'},
  {href:'algo/merge-sort.html', label:'归并排序', desc:'分治拆分再归并有序序列，稳定且复杂度 O(n log n)。'},
  {href:'algo/quick-sort.html', label:'快速排序', desc:'基于 pivot 分区的原地排序，是工程中常见的排序基础。'},
  {href:'algo/heap-sort.html', label:'堆排序', desc:'利用堆结构反复取最大或最小元素完成排序。'},
  {href:'algo/counting-sort.html', label:'计数排序', desc:'用计数数组处理有限整数范围内的线性排序。'},
  {href:'algo/radix-sort.html', label:'基数排序', desc:'按位分桶排序，适合固定长度整数或字符串。'},
  {href:'algo/topological-sort.html', label:'拓扑排序', desc:'处理 DAG 依赖顺序，常见于任务调度、数据管道和构建依赖。'},
  {href:'algo/binary-search.html', label:'二分查找', desc:'在有序空间中快速定位边界，是索引查找、范围查询和分片定位的基础。'},
  {href:'algo/kmp.html', label:'KMP / 字符串匹配', desc:'高效字符串匹配思想，可连接日志检索、协议解析和关键字过滤。'},
  {href:'algo/linked-list.html', label:'链表', desc:'通过指针连接节点，适合理解插入删除和内存局部性取舍。'},
  {href:'algo/stack.html', label:'栈', desc:'后进先出结构，连接递归、表达式解析和调用栈。'},
  {href:'algo/queue.html', label:'队列', desc:'先进先出结构，连接 BFS、任务调度和消息缓冲。'},
  {href:'algo/heap.html', label:'堆 / Top-K', desc:'优先队列、外部排序、调度和 Top-K 的底层结构。'},
  {href:'algo/hash-table.html', label:'哈希表 / 哈希索引', desc:'O(1) 平均查找的基础，也是缓存、索引和分片的关键。'},
  {href:'algo/skip-list.html', label:'跳表', desc:'多层链表的概率平衡结构，Redis 大 ZSet 常见基础。'},
  {href:'algo/binary-search-tree.html', label:'二叉搜索树', desc:'通过左右子树有序性支持查找、插入和删除。'},
  {href:'algo/avl-tree.html', label:'AVL 树', desc:'严格平衡的二叉搜索树，用旋转控制高度。'},
  {href:'algo/b-tree.html', label:'B 树', desc:'多路平衡搜索树，是理解磁盘友好索引的前置结构。'},
  {href:'algo/b-plus-tree.html', label:'算法 B+ 树', desc:'从数据结构角度理解 B+ 树节点、分裂与范围遍历。'},
  {href:'algo/trie.html', label:'Trie 前缀树', desc:'前缀匹配结构，可用于 DNS 域名层级、路由匹配、自动补全和字典检索。'},
  {href:'algo/segment-tree.html', label:'线段树 / 区间聚合', desc:'维护区间聚合和在线更新，可类比监控窗口、时间序列和区间统计。'},
  {href:'algo/tree-traversal.html', label:'树遍历', desc:'前序、中序、后序和层序遍历帮助理解树结构访问顺序。'},
  {href:'algo/union-find.html', label:'并查集', desc:'高效维护连通分量，可类比集群成员、网络分区和副本组连通性。'},
  {href:'algo/bfs.html', label:'BFS', desc:'逐层扩展的图遍历算法，用于最短跳数、依赖扩散和网络连通性分析。'},
  {href:'algo/dfs.html', label:'DFS', desc:'深度优先遍历可用于环检测、死锁检测、拓扑排序和依赖图分析。'},
  {href:'algo/dijkstra.html', label:'Dijkstra', desc:'单源最短路径算法，是理解路由选择、网络代价和服务路径优化的基础。'},
  {href:'algo/bellman-ford.html', label:'Bellman-Ford', desc:'可处理负权边的单源最短路径算法。'},
  {href:'algo/kruskal.html', label:'Kruskal', desc:'基于并查集构造最小生成树。'},
  {href:'algo/knapsack.html', label:'背包问题', desc:'动态规划经典问题，展示状态与选择的关系。'},
  {href:'algo/lcs.html', label:'最长公共子序列', desc:'用二维动态规划处理序列匹配。'},
  {href:'algo/lis.html', label:'最长递增子序列', desc:'连接动态规划、二分优化和有序边界维护。'},
  {href:'db/db-architecture.html', label:'数据库架构', desc:'从连接层、解析优化、执行引擎到存储引擎理解数据库整体链路。'},
  {href:'db/query-path.html', label:'查询执行路径', desc:'SQL 从客户端到磁盘页的完整执行路径。'},
  {href:'db/storage-layout.html', label:'存储布局 / 页', desc:'页、区、段和磁盘布局，是 B+ 树、Buffer Pool、WAL 的物理基础。'},
  {href:'db/buffer-pool.html', label:'Buffer Pool', desc:'数据库页缓存，和 LRU、脏页、WAL 强相关。'},
  {href:'db/wal.html', label:'WAL / Redo', desc:'先写日志再写数据页，保证崩溃恢复。'},
  {href:'db/mysql-logs.html', label:'MySQL 日志体系', desc:'Redo Log / Binlog 分工、checkpoint 机制和 CDC 数据同步链路。'},
  {href:'db/btree-index.html', label:'B+ 树', desc:'数据库主流索引结构，依赖多路平衡树、页和叶子链表。'},
  {href:'db/hash-index.html', label:'哈希索引', desc:'通过 hash 映射定位记录，适合等值查询但不适合范围扫描。'},
  {href:'db/query-plan.html', label:'查询计划', desc:'优化器选择访问路径、Join 顺序和执行算子的成本模型。'},
  {href:'db/join-algo.html', label:'Join 算法', desc:'Nested Loop、Hash Join、Sort-Merge Join 的执行代价。'},
  {href:'db/external-sort.html', label:'外部排序', desc:'分块排序与 K 路归并，依赖堆和磁盘 I/O。'},
  {href:'db/mvcc.html', label:'MVCC', desc:'通过版本链和快照读实现读写不阻塞。'},
  {href:'db/transaction.html', label:'锁 / 死锁', desc:'两阶段锁、等待图和 DFS 环检测。'},
  {href:'db/distributed-db.html', label:'分布式数据库', desc:'CAP、Raft、分片和副本，和 Kafka ISR、网络分区、一致性语义相互关联。'},
  {href:'db/cache-layers.html', label:'缓存分层', desc:'从浏览器、CDN、应用缓存、Redis 到数据库 Buffer Pool 的多级缓存链路。'},
  {href:'redis/data-types.html', label:'Redis 数据类型', desc:'String/List/Hash/Set/ZSet 与 listpack、quicklist、skiplist。'},
  {href:'redis/persistence.html', label:'Redis 持久化', desc:'RDB、AOF、rewrite 与 fsync 策略，和 WAL、Page Cache、顺序写相关。'},
  {href:'redis/eviction.html', label:'Redis 淘汰策略', desc:'LRU、LFU、TTL 与内存上限控制。'},
  {href:'redis/cluster.html', label:'Redis Cluster', desc:'槽位分片、主从复制和故障转移，和一致性、网络分区、客户端路由相关。'},
  {href:'redis/distributed-lock.html', label:'Redis 分布式锁', desc:'SET NX PX、Lua 原子释放、Redlock 与一致性边界。'},
  {href:'redis/lru-lfu.html', label:'LRU / LFU', desc:'缓存淘汰算法，连接 Redis 淘汰策略、数据库 Buffer Pool 和多级缓存设计。'},
  {href:'redis/redis-stream.html', label:'Redis Stream', desc:'Stream 日志带+ConsumerGroup 游标+PEL 确认列表，带消费者组和 ACK 的消息流结构。'},
  {href:'redis/pipeline.html', label:'Redis Pipeline', desc:'批量命令消除 RTT 等待，时间线对比展示 Pipeline 灰色等待段大幅缩短。'},
  {href:'redis/pubsub.html', label:'Pub/Sub', desc:'发布订阅频道模型和模式匹配，与 Stream 消费语义的对比。'},
  {href:'linux/io-models.html', label:'epoll / I/O 多路复用', desc:'高并发服务器和 Redis 单线程事件循环的系统基础。'},
  {href:'linux/virtual-memory.html', label:'虚拟内存 / mmap', desc:'页表、TLB、缺页异常、mmap 与数据库页缓存有关。'},
  {href:'linux/filesystem.html', label:'VFS / inode', desc:'文件系统抽象，和 WAL、日志文件、零拷贝链路相关。'},
  {href:'linux/scheduling.html', label:'CFS / EEVDF', desc:'进程调度、公平性和延迟优化。'},
  {href:'linux/commands.html', label:'Linux 常用命令', desc:'ps、ss、df、du、curl、grep 等命令连接进程、网络、磁盘和日志排障。'},
  {href:'linux/process-lifecycle.html', label:'进程生命周期', desc:'进程创建、运行、阻塞、退出和回收的生命周期。'},
  {href:'linux/sequential-io.html', label:'顺序写 / Page Cache', desc:'Kafka、WAL、LSM 都依赖顺序写、批量刷盘和 Linux Page Cache 提升吞吐。'},
  {href:'linux/zero-copy.html', label:'零拷贝', desc:'sendfile / mmap 减少内核态与用户态数据拷贝，是 Kafka 高吞吐和 HTTP 文件服务的核心优化。'},
  {href:'linux/ebpf.html', label:'eBPF', desc:'现代 Linux 可观测、网络和安全能力的核心技术。'},
  {href:'linux/cgroup.html', label:'cgroup / Namespace', desc:'容器资源限制和隔离的系统基础。'},
  {href:'linux/ipc.html', label:'进程间通信 / IPC', desc:'管道、共享内存、消息队列、信号量各自的语义和性能权衡，是多进程架构的基础。'},
  {href:'linux/signal.html', label:'信号 / Signal', desc:'内核异步通知机制，信号产生→传递→处理的生命周期，优雅退出和 core dump 的底层原理。'},
  {href:'linux/network-stack.html', label:'Linux 网络协议栈', desc:'socket→TCP→IP→Netfilter→网卡 DMA 的完整收发包路径，是网络调优和 eBPF 的基础。'},
  {href:'linux/container.html', label:'容器原理', desc:'Namespace+Cgroup+OverlayFS 三层组合实现隔离，容器不是虚拟机。'},
  {href:'linux/perf-tools.html', label:'性能工具', desc:'USE 方法论指导 perf/eBPF/bpftrace 系统性定位 CPU/内存/IO 瓶颈。'},
  {href:'linux/systemd.html', label:'Systemd', desc:'PID 1 服务管理、Unit 依赖图、socket activation 和 cgroup 集成。'},
  {href:'network/tcp-handshake.html', label:'TCP 握手', desc:'连接建立、关闭、TIME_WAIT 和可靠传输基础。'},
  {href:'network/tcp-congestion.html', label:'拥塞控制', desc:'慢启动、拥塞避免、CUBIC、BBR 与网络吞吐。'},
  {href:'network/http.html', label:'HTTP/2 / HTTP/3', desc:'HTTP 演进、TLS 1.3、QUIC 和队头阻塞。'},
  {href:'network/dns.html', label:'DNS / CDN', desc:'域名解析、缓存、TTL 和边缘调度。'},
  {href:'network/load-balancing.html', label:'负载均衡', desc:'四层/七层负载均衡、健康检查、会话保持和反向代理。'},
  {href:'network/quic.html', label:'QUIC', desc:'UDP 上的现代传输协议，内置 TLS 1.3、连接迁移和独立流。'},
  {href:'network/tls.html', label:'TLS 1.3', desc:'TLS 1.3 握手、证书链验证、前向安全和 0-RTT 复用，是 HTTPS/gRPC/QUIC 的加密基础。'},
  {href:'network/websocket.html', label:'WebSocket', desc:'HTTP Upgrade 握手、全双工帧传输和心跳机制，适合实时通信场景。'},
  {href:'network/grpc.html', label:'gRPC / Protobuf', desc:'HTTP/2 多路复用、Protobuf 二进制序列化和四种流 RPC 模式，是微服务间通信的主流选择。'},
  {href:'network/http2.html', label:'HTTP/2', desc:'二进制帧、多路复用、HPACK 头部压缩，解决 HTTP/1.1 应用层队头阻塞。'},
  {href:'network/cdn.html', label:'CDN', desc:'地理就近 PoP 节点、GSLB 路由和 TTL 驱动的缓存命中/回源策略。'},
  {href:'network/nat.html', label:'NAT', desc:'SNAT/DNAT 地址转换、NAT 类型和 STUN/TURN/ICE 穿透机制。'},
  {href:'network/bgp.html', label:'BGP', desc:'路径向量协议、AS 路由策略（LOCAL_PREF/AS_PATH/MED）和 RPKI 防劫持。'},
  {href:'kafka/kafka-overview.html', label:'Kafka 存储模型', desc:'Topic、Partition、Segment、Offset、顺序写和 Page Cache 构成 Kafka 高吞吐基础。'},
  {href:'kafka/producer.html', label:'Kafka Producer', desc:'Batch、linger.ms、acks、幂等性和吞吐延迟权衡。'},
  {href:'kafka/consumer.html', label:'Kafka Consumer', desc:'Offset、提交语义、消费组和 Exactly Once 边界。'},
  {href:'kafka/partition-replication.html', label:'Partition / ISR', desc:'分区、副本、ISR、Leader 选举与高可用。'},
  {href:'kafka/consumer-group.html', label:'Consumer Group', desc:'Rebalance、分区分配和消费扩展。'},
  {href:'kafka/kraft.html', label:'KRaft', desc:'Kafka 元数据管理的新模式，逐步替代 ZooKeeper。'},
  {href:'kafka/exactly-once.html', label:'Exactly Once', desc:'幂等 Producer、事务和 offset 原子提交组合出的端到端处理语义。'},
  {href:'cs/cpu.html', label:'CPU 指令 / 流水线', desc:'取指、译码、执行、流水线、分支预测和乱序执行。'},
  {href:'cs/cache.html', label:'Cache 层次 / 缓存行', desc:'L1/L2/L3、缓存行、局部性和 false sharing 的硬件基础。'},
  {href:'cs/memory.html', label:'内存寻址 / TLB', desc:'虚拟地址、页表、MMU、TLB 和物理内存访问链路。'},
  {href:'cs/io.html', label:'总线 / 中断 / DMA', desc:'设备和 CPU 之间通过总线、中断、DMA 进行高效协作。'},
  {href:'cs/number.html', label:'补码 / IEEE 754', desc:'整数补码表示和 IEEE 754 浮点数格式，理解溢出和精度陷阱的底层原因。'},
  {href:'cs/barrier.html', label:'内存屏障', desc:'Store/Load barrier、mfence、Go 内存模型的硬件根源。'},
  {href:'cs/atomic.html', label:'原子指令', desc:'CAS、LL/SC、x86 LOCK 前缀，sync/atomic 底层实现。'},
  {href:'cs/branch-prediction.html', label:'分支预测', desc:'流水线投机执行、预测失败 flush 代价和两位饱和计数器状态机。'},
  {href:'cs/tlb.html', label:'TLB', desc:'虚拟地址 VPN+Offset 拆分，TLB hit 1次访存 vs miss 四级页表遍历 5次。'},
  {href:'cs/numa.html', label:'NUMA', desc:'跨 NUMA 节点访存延迟 2-3x，numactl 绑定优化和 false sharing 隔离。'},
  {href:'golang/type-system.html', label:'Go 类型系统', desc:'类型、方法集、接口、泛型和显式错误处理。'},
  {href:'golang/string.html', label:'字符串', desc:'字符串不可变、UTF-8、rune 和底层字节序列。'},
  {href:'golang/interface.html', label:'Interface', desc:'隐式满足、nil interface 陷阱、iface/eface 内部结构。'},
  {href:'golang/embedding.html', label:'嵌入组合', desc:'通过嵌入实现组合式代码复用和方法提升。'},
  {href:'golang/error.html', label:'Error 处理', desc:'error 接口、sentinel、%w 包装、Is/As 展开链和自定义错误类型。'},
  {href:'golang/generics.html', label:'泛型', desc:'type param、约束、any/comparable 和泛型适用场景。'},
  {href:'golang/closure.html', label:'闭包', desc:'闭包捕获变量、生命周期和逃逸分析关系。'},
  {href:'golang/defer-panic.html', label:'defer / panic / recover', desc:'defer 执行顺序、panic 传播和 recover 边界。'},
  {href:'golang/slice-map.html', label:'切片与 Map', desc:'slice header、扩容、map bucket 和并发安全边界。'},
  {href:'golang/reflect.html', label:'反射', desc:'Type/Value、运行时元信息和动态调用成本。'},
  {href:'golang/gmp.html', label:'GMP 调度器', desc:'G、M、P、work stealing、syscall 阻塞和 netpoller。'},
  {href:'golang/gc.html', label:'Go GC', desc:'并发三色标记、写屏障、堆分配和 pprof 诊断。'},
  {href:'golang/channel.html', label:'Channel', desc:'无缓冲/有缓冲 channel、close 语义、select 多路复用和 goroutine 协作模式。'},
  {href:'golang/goroutine.html', label:'Goroutine', desc:'goroutine、channel、context 和 sync 包组成 Go 并发模型。'},
  {href:'golang/memory-alloc.html', label:'内存分配器', desc:'mcache → mcentral → mheap 三级分配链路与大对象路径。'},
  {href:'golang/escape.html', label:'逃逸分析', desc:'编译期决定变量在栈还是堆分配，栈分配零 GC 压力。'},
  {href:'golang/select.html', label:'Select', desc:'多路 channel 等待、default 非阻塞、time.After 超时模式。'},
  {href:'golang/context.html', label:'Context', desc:'WithCancel/WithTimeout/WithValue 取消树，控制 goroutine 生命周期。'},
  {href:'golang/timer.html', label:'Timer/Ticker', desc:'time.Timer 与 Ticker 机制、Reset 竞态、goroutine 泄漏陷阱。'},
  {href:'golang/concurrent-patterns.html', label:'并发模式', desc:'pipeline、fan-out/fan-in、worker pool 的 channel 组合模式。'},
  {href:'golang/memory-model.html', label:'Go 内存模型 / 同步', desc:'happens-before、Mutex、channel、atomic、data race 和 false sharing。'},
  {href:'golang/sync.html', label:'Sync 原语', desc:'Mutex/RWMutex/WaitGroup/Once/Cond 使用模式与死锁场景。'},
  {href:'golang/atomic.html', label:'Atomic', desc:'原子操作、CAS、内存序和与 Mutex 的边界选择。'},
  {href:'golang/syncpool.html', label:'sync.Pool', desc:'对象复用池、GC 回收时机和减少 GC 压力的使用场景。'},
  {href:'golang/errgroup.html', label:'errgroup', desc:'结构化并发、goroutine 错误收集与 WaitGroup 的关系。'},
  {href:'golang/io.html', label:'io.Reader / io.Writer', desc:'package 边界、context、io.Reader/Writer、error wrapping 和标准库资源生命周期。'},
  {href:'golang/http.html', label:'Go Web / RPC 服务', desc:'net/http、middleware、handler/service/repo 分层、超时、连接池和优雅退出。'},
  {href:'golang/json.html', label:'encoding/json', desc:'JSON 编解码、标签、零值和性能优化。'},
  {href:'golang/sql.html', label:'database/sql', desc:'连接池、事务、预处理和上下文取消。'},
  {href:'golang/strings-bytes.html', label:'strings / bytes', desc:'字符串、字节切片和转换成本。'},
  {href:'golang/modules.html', label:'Go Modules', desc:'模块版本、依赖解析和可复现构建。'},
  {href:'golang/testing.html', label:'Go 测试', desc:'table-driven test、benchmark、race detector 和 pprof 组成质量闭环。'},
  {href:'golang/pprof.html', label:'pprof 性能分析', desc:'CPU、内存、阻塞和 goroutine profile 定位性能瓶颈。'},
  {href:'golang/patterns.html', label:'Go 服务架构', desc:'cmd/main、handler、service、repo、infra、配置和可观测性的工程边界。'},
  {href:'golang/unsafe.html', label:'unsafe', desc:'unsafe.Pointer 用法、uintptr 与 GC 的关系和底层内存操作。'},
  {href:'algo/sliding-window.html', label:'滑动窗口', desc:'连续窗口内增量维护状态，是限流、TCP 拥塞窗口、流式统计的基础模式。'},
  {href:'algo/monotonic.html', label:'单调队列 / 栈', desc:'维护候选集合单调性，用于窗口最值、监控峰值和实时指标计算。'},
  {href:'algo/probabilistic-ds.html', label:'近似数据结构', desc:'Bloom、HLL、Count-Min Sketch 用可控误差换内存，适合海量判重、基数和频率估计。'},
  {href:'algo/heavy-hitters.html', label:'Top-K / Heavy Hitters', desc:'用堆、哈希和近似计数发现热点数据，连接热 key、日志分析、告警和推荐。'},
  {href:'algo/bloom.html', label:'Bloom Filter', desc:'概率型判重结构，适合缓存穿透防护与大规模集合过滤。'},
  {href:'algo/red-black-tree.html', label:'红黑树', desc:'自平衡二叉搜索树，通过颜色和旋转保证 O(log n)，是 Linux CFS/Java TreeMap 的底层结构。'},
  {href:'algo/fenwick-tree.html', label:'树状数组 / BIT', desc:'利用 lowbit 高效维护前缀和，查询和更新均为 O(log n)，代码极简。'},
  {href:'algo/floyd-warshall.html', label:'Floyd-Warshall', desc:'三重循环 DP 求全源最短路，可处理负权边，并顺带检测负权环。'},
  {href:'algo/backtracking.html', label:'回溯算法', desc:'系统枚举解空间树，做选择→递归→撤销选择，剪枝避免无效搜索路径。'},
  {href:'algo/greedy.html', label:'贪心算法', desc:'每步局部最优，贪心选择性质和最优子结构是成立前提，活动选择和霍夫曼编码是经典案例。'},
  {href:'algo/aho-corasick.html', label:'AC 自动机', desc:'Trie + KMP fail 指针构成的多模式匹配自动机，一次遍历文本匹配所有模式串。'},
  {href:'algo/max-flow.html', label:'最大流', desc:'增广路算法和残差图，正向流量增加时反向边同步变化的 Ford-Fulkerson 机制。'},
  {href:'algo/string-hashing.html', label:'字符串哈希', desc:'Rabin-Karp 滚动哈希 O(1) 移动窗口，哈希碰撞时回退逐字符对比。'},
  {href:'algo/bit-manipulation.html', label:'位运算', desc:'AND/OR/XOR 基本操作、Brian Kernighan 清最低位和状态压缩 DP 用位表示集合。'},
  {href:'algo/two-pointers.html', label:'双指针', desc:'对撞指针/快慢指针/滑动窗口/归并四种模式将 O(n²) 降至 O(n)。'},
  {href:'algo/divide-conquer.html', label:'分治', desc:'主定理分析递推式、归并排序求逆序对、矩阵快速幂和 Karatsuba 大整数乘法。'},
  {href:'distributed/consistent-hash.html', label:'一致性哈希', desc:'把 key 映射到环上，减少扩缩容时的数据迁移，是缓存、分片、负载均衡的经典算法。'},
  {href:'distributed/paxos.html', label:'Paxos', desc:'Multi-Paxos 是分布式一致性的理论原型，Raft 是其工程简化版。'},
  {href:'distributed/raft.html', label:'Raft', desc:'Leader 选举、日志复制和成员变更，是 etcd、TiKV 和 KRaft 的分布式一致性基础。'},
  {href:'distributed/cap-theorem.html', label:'CAP 定理', desc:'分布式系统在一致性、可用性、分区容忍性三者间的权衡。'},
  {href:'distributed/2pc.html', label:'两阶段提交', desc:'Prepare/Commit 两阶段原子提交协议，协调者单点和参与者阻塞是其核心局限。'},
  {href:'distributed/saga.html', label:'Saga 模式', desc:'通过补偿事务实现最终一致性的分布式事务模式，避免 2PC 全局锁。'},
  {href:'distributed/zookeeper.html', label:'ZooKeeper', desc:'ZAB 协议驱动的分布式协调服务，提供强一致的 znode 树和 Watch 通知。'},
  {href:'distributed/gossip.html', label:'Gossip 协议', desc:'随机选邻居传播信息，O(log N) 轮覆盖全集群，天然容错的成员状态同步机制。'},
  {href:'distributed/crdt.html', label:'CRDT', desc:'无冲突复制数据类型，任何副本接收到所有操作后状态相同，无需协调。'},
  {href:'distributed/base.html', label:'BASE 理论', desc:'基本可用、软状态、最终一致性——AP 分布式系统的设计哲学，是 ACID 的对立面。'},
  {href:'distributed/vector-clock.html', label:'向量时钟', desc:'多节点向量数组 max 合并，无法比较大小的两个时钟代表并发事件。'},
  {href:'distributed/service-discovery.html', label:'服务注册与发现', desc:'心跳驱动的健康检查、Registry 和 Client 本地缓存最终一致性同步。'},
  {href:'distributed/distributed-tracing.html', label:'分布式追踪', desc:'瀑布图可视化 Span 嵌套时间关系，traceparent 在服务间传播 TraceID/SpanID。'},
  {href:'db/lsm.html', label:'LSM Tree', desc:'面向写入优化的存储结构，RocksDB/TiKV/LevelDB 生态常见。'},
  {href:'db/vector.html', label:'向量索引', desc:'HNSW、IVF、PQ 等 ANN 索引是 RAG 与向量数据库基础。'},
  {href:'db/replication.html', label:'MySQL 主从复制', desc:'Binlog 传输、GTID 全局事务 ID、半同步复制和复制延迟，读写分离和 CDC 的基础。'},
  {href:'db/explain.html', label:'EXPLAIN 执行计划', desc:'type/key/rows/Extra 字段解读，识别全表扫描和 filesort，SQL 性能优化的主要工具。'},
  {href:'db/connection-pool.html', label:'数据库连接池', desc:'连接复用避免重复握手开销，池大小设置、超时参数和泄漏检测是核心配置项。'},
  {href:'db/sharding.html', label:'分库分表', desc:'哈希分片路由单 shard、scatter-gather 跨 shard 代价和在线再平衡双写迁移。'},
  {href:'db/full-text-search.html', label:'全文检索', desc:'倒排索引构建 posting list、双指针归并交集和 BM25 TF-IDF 相关性打分。'},
  {href:'system-design/feed-system.html', label:'信息流系统', desc:'推模式/拉模式/混合扇出策略，用 Redis sorted set 和 Kafka 构建低延迟 Timeline。'},
  {href:'system-design/chat-system.html', label:'即时通讯系统', desc:'WebSocket 长连接管理、消息顺序 ID、收件箱和离线推送的完整 IM 架构。'},
  {href:'system-design/search-suggest.html', label:'搜索自动补全', desc:'前缀 Trie/Redis sorted set、候选词排分和实时热词聚合，100ms 内返回补全结果。'},
  {href:'system-design/object-storage.html', label:'对象存储', desc:'分块上传、纠删码副本、元数据分离和 GC 机制，是 S3/OSS 的核心设计模式。'},
  {href:'system-design/task-scheduler.html', label:'分布式任务调度', desc:'时间轮 O(1) 触发、分布式分片和幂等执行，保证任务准时不重复地执行。'},
  {href:'system-design/geo-service.html', label:'地理位置服务', desc:'GeoHash 将经纬度编码为可索引字符串，四叉树支持非均匀 POI 分布的范围查询。'},
  {href:'system-design/api-gateway.html', label:'API Gateway', desc:'认证/限流/路由/熔断串联，每个策略有独立内部状态，请求球逐层通过。'},
  {href:'system-design/notification-system.html', label:'通知系统', desc:'优先级队列多渠道并行、失败重试倒计时和幂等 key 防重复投递。'},
  {href:'system-design/web-crawler.html', label:'网络爬虫', desc:'BFS 向外扩展 URL、Bloom Filter 位数组判重和 robots.txt 过滤。'},
  {href:'system-design/video-streaming.html', label:'视频流媒体', desc:'分片并行转码多分辨率、ABR 自适应码率和 CDN 边缘分发。'},
  {href:'system-design/payment-system.html', label:'支付系统', desc:'两阶段预扣确认状态机、幂等键防重复支付和对账任务补偿回滚。'},
  {href:'system-design/metrics-monitoring.html', label:'监控系统', desc:'TSDB 时序列存块、Alertmanager 聚合抑制和多维指标采集流水线。'},
  {href:'cloud-native/docker.html', label:'Docker 镜像分层', desc:'每条 Dockerfile 指令生成一层，OverlayFS 叠加只读镜像和可写容器层，CoW 写时复制。'},
  {href:'cloud-native/kubernetes.html', label:'K8s 控制面', desc:'kubectl apply → API Server 认证鉴权 → etcd Raft → Controller Watch → Scheduler → kubelet。'},
  {href:'cloud-native/k8s-scheduling.html', label:'Pod 调度', desc:'Filter 淘汰不满足节点（资源/Taint），Score 多插件加权打分，最优节点绑定 Pod。'},
  {href:'cloud-native/k8s-networking.html', label:'Service 网络', desc:'ClusterIP 是虚拟 IP，iptables DNAT 规则完成真正的负载均衡转发，VXLAN 跨节点。'},
  {href:'cloud-native/k8s-hpa.html', label:'HPA 弹性伸缩', desc:'metrics-server 提供 CPU 指标，HPA 公式计算目标副本数，冷却期防频繁伸缩。'},
  {href:'observability/prometheus.html', label:'Prometheus', desc:'拉取模式 Scrape 每 15s、TSDB 内存块压缩到磁盘和 Alertmanager 规则持续评估。'},
  {href:'observability/tracing.html', label:'OpenTelemetry 追踪', desc:'traceparent 头传播 traceId/spanId，Span 批量 OTLP 上报，瀑布图可视化调用链。'},
  {href:'observability/slo.html', label:'SLO & Error Budget', desc:'SLO 目标定义月故障预算，Error Budget 耗尽冻结发布，Burn Rate 预警。'},
  {href:'security/crypto.html', label:'对称/非对称加密', desc:'AES-CBC 链式加密和 RSA 加密/签名方向，加密保机密性，签名保真实性。'},
  {href:'security/oauth.html', label:'OAuth 2.0', desc:'授权码流程四角色，Code 一次性后端渠道换 Token，Access Token 有过期时间。'},
  {href:'security/web-attacks.html', label:'Web 攻击', desc:'SQL 注入代码数据混淆、XSS 输出编码防御和 CSRF SameSite Cookie+Token 双重防御。'},
  {href:'security/jwt.html', label:'JWT', desc:'三段 Base64 结构解析、HMAC-SHA256 签名验证流程和 alg:none 安全漏洞说明。'},
  {href:'ai/fine-tuning.html', label:'微调 / LoRA', desc:'SFT 指令对齐、LoRA 低秩分解参数高效微调，让预训练模型适应特定任务的主要方法。'},
  {href:'ai/rlhf.html', label:'RLHF', desc:'奖励模型 + PPO 强化学习，通过人类偏好对比数据让模型输出更符合期望。'},
  {href:'ai/quantization.html', label:'模型量化', desc:'INT8/INT4 量化将显存需求降低 4-8x，GPTQ/AWQ 是主流训练后量化方案。'},
  {href:'ai/diffusion.html', label:'扩散模型', desc:'前向加噪 + 逆向去噪，DDPM 奠定理论基础，Stable Diffusion 结合 CLIP 实现文生图。'},
  {href:'ai/embedding.html', label:'Embedding 模型', desc:'对比学习将文本映射为向量，语义相近距离更近，是语义搜索和 RAG 的向量化基础。'},
  {href:'ai/prompt-engineering.html', label:'Prompt Engineering', desc:'CoT、Few-shot、系统提示等技巧引导 LLM，了解 RAG vs Fine-tuning 的选择边界。'},
  {href:'ai/tokenization.html', label:'BPE 分词', desc:'字节对编码迭代合并高频相邻对，词表从数据统计中生成。'},
  {href:'ai/llm-serving.html', label:'LLM 推理服务', desc:'PagedAttention 分页显存管理消除碎片，连续批处理提升 GPU 利用率。'},
  {href:'ai/multimodal.html', label:'多模态 AI', desc:'CLIP 对齐视觉语言、跨模态注意力和扩散模型生成多类型内容。'},
  {href:'ai/context-length.html', label:'长上下文 LLM', desc:'RoPE 位置编码外推、KV Cache 压缩和 Lost in the Middle 长文本注意力问题。'},
];

// ── href → node 映射 ─────────────────────────────────────────────────────────
const nodeMap = new Map(NODES.map(n => [n.href, n]));

// ── 生成单个页面的 SEO meta block ─────────────────────────────────────────────
function buildSeoBlock(node) {
  const url = `${BASE_URL}/${node.href}`;
  const title = node.href === 'index.html'
    ? SITE_NAME
    : `${node.label} — ${SITE_NAME}`;
  const desc = node.desc;

  return [
    `<meta name="description" content="${esc(desc)}">`,
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(desc)}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:type" content="article">`,
    `<meta property="og:site_name" content="${SITE_NAME}">`,
    `<meta name="twitter:card" content="summary">`,
    `<meta name="twitter:title" content="${esc(title)}">`,
    `<meta name="twitter:description" content="${esc(desc)}">`,
  ].join('\n');
}

function esc(str) {
  return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── 注入到 HTML 文件 ──────────────────────────────────────────────────────────
function injectSeo(filePath, href) {
  const node = nodeMap.get(href);
  if (!node) {
    console.warn(`  [skip] no node data for: ${href}`);
    return false;
  }

  let html = fs.readFileSync(filePath, 'utf8');

  // 幂等检查：已有 og:title 则跳过
  if (html.includes('og:title')) {
    console.log(`  [skip] already has og:title: ${href}`);
    return false;
  }

  const seoBlock = buildSeoBlock(node);

  // 插入位置：viewport meta 之后
  const viewportRe = /(<meta[^>]+name=["']viewport["'][^>]*>)/i;
  if (viewportRe.test(html)) {
    html = html.replace(viewportRe, `$1\n${seoBlock}`);
  } else {
    // fallback：插在 charset meta 之后
    const charsetRe = /(<meta[^>]+charset[^>]*>)/i;
    if (charsetRe.test(html)) {
      html = html.replace(charsetRe, `$1\n${seoBlock}`);
    } else {
      console.warn(`  [warn] no suitable insertion point in: ${href}`);
      return false;
    }
  }

  fs.writeFileSync(filePath, html, 'utf8');
  return true;
}

// ── 主流程 ───────────────────────────────────────────────────────────────────
let processed = 0;
let skipped = 0;
const sitemapUrls = [];

function processFile(filePath, href) {
  const ok = injectSeo(filePath, href);
  if (ok) {
    processed++;
    console.log(`  [ok] ${href}`);
  } else {
    skipped++;
  }
  sitemapUrls.push(href);
}

// 1. 处理 index.html（根目录）
const indexPath = path.join(ROOT, 'index.html');
if (fs.existsSync(indexPath)) processFile(indexPath, 'index.html');

// 2. 处理各模块目录
for (const mod of MODULES) {
  const modDir = path.join(ROOT, mod);
  if (!fs.existsSync(modDir)) continue;

  const files = fs.readdirSync(modDir).filter(f => f.endsWith('.html'));
  for (const file of files) {
    const href = `${mod}/${file}`;
    processFile(path.join(modDir, file), href);
  }
}

// 3. 处理根目录其他 HTML 文件（graph.html, architecture.html 等）
const rootHtmlFiles = fs.readdirSync(ROOT).filter(
  f => f.endsWith('.html') && f !== 'index.html'
);
for (const file of rootHtmlFiles) {
  const href = file;
  // 这些页面没有 graph node，用通用数据
  const filePath = path.join(ROOT, file);
  let html = fs.readFileSync(filePath, 'utf8');
  if (!html.includes('og:title')) {
    // 尝试从 <title> 提取标题
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    const label = titleMatch ? titleMatch[1] : SITE_NAME;
    const url = `${BASE_URL}/${href}`;
    const desc = `${label} — ${SITE_NAME}`;
    const block = [
      `<meta name="description" content="${esc(desc)}">`,
      `<link rel="canonical" href="${url}">`,
      `<meta property="og:title" content="${esc(label)}">`,
      `<meta property="og:description" content="${esc(desc)}">`,
      `<meta property="og:url" content="${url}">`,
      `<meta property="og:type" content="website">`,
      `<meta property="og:site_name" content="${SITE_NAME}">`,
      `<meta name="twitter:card" content="summary">`,
      `<meta name="twitter:title" content="${esc(label)}">`,
      `<meta name="twitter:description" content="${esc(desc)}">`,
    ].join('\n');

    const viewportRe = /(<meta[^>]+name=["']viewport["'][^>]*>)/i;
    if (viewportRe.test(html)) {
      html = html.replace(viewportRe, `$1\n${block}`);
      fs.writeFileSync(filePath, html, 'utf8');
      processed++;
      console.log(`  [ok] ${href}`);
    }
  } else {
    skipped++;
  }
  sitemapUrls.push(href);
}

// ── 生成 sitemap.xml ─────────────────────────────────────────────────────────
const sitemapPath = path.join(ROOT, 'sitemap.xml');
const urlEntries = sitemapUrls
  .map(href => {
    const priority = href === 'index.html' ? '1.0'
      : href.endsWith('/index.html') ? '0.8'
      : '0.6';
    const changefreq = href === 'index.html' ? 'weekly' : 'monthly';
    return `  <url>
    <loc>${BASE_URL}/${href}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  })
  .join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;

fs.writeFileSync(sitemapPath, sitemap, 'utf8');
console.log(`\n[sitemap] written: sitemap.xml (${sitemapUrls.length} URLs)`);

// ── 汇总 ─────────────────────────────────────────────────────────────────────
console.log(`\n✓ Done — processed: ${processed}, skipped: ${skipped}`);
