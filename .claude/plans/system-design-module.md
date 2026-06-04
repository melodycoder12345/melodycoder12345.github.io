# 系统设计 (System Design) 模块实现计划

## 概述

新增一个顶级模块 `system-design`，包含 5 个经典系统设计专题页面，全部采用 C 类型（系统流程动画页）。模块颜色建议使用 `#f59e0b`（琥珀色/金色），与现有模块颜色区分度好，且暗示「工程/设计」的含义。

## 首批 5 个专题

| 专题 | 文件 | Node ID | 说明 |
|------|------|---------|------|
| 短链系统 | `system-design/short-url.html` | `sd-short-url` | URL 哈希、Base62、数据库存储、缓存、302 重定向 |
| 限流器 | `system-design/rate-limiter.html` | `sd-rate-limiter` | 令牌桶、滑动窗口、分布式限流（Redis）、降级策略 |
| 分布式 ID | `system-design/distributed-id.html` | `sd-distributed-id` | Snowflake、时钟回拨、Leaf、号段模式、分片分配 |
| 消息推送系统 | `system-design/push-system.html` | `sd-push-system` | 长连接管理、Kafka 分发、消息扇出、ACK/重试 |
| 秒杀系统 | `system-design/flash-sale.html` | `sd-flash-sale` | 限流→队列→库存扣减→异步下单、缓存预热、降级 |

## 涉及文件清单

按照 `module-node-spec.md` 的 Checklist 执行：

### 1. 新增目录和文件
- `system-design/index.html` — 模块首页
- `system-design/short-url.html` — C 类型页面
- `system-design/rate-limiter.html` — C 类型页面
- `system-design/distributed-id.html` — C 类型页面
- `system-design/push-system.html` — C 类型页面
- `system-design/flash-sale.html` — C 类型页面

### 2. 更新全局文件
- `graph-data.js` — 新增 `GRAPH_MODULES.system-design`、module node、5 个 page node、以及跨模块边
- `index.html` — hero-actions 加入口按钮 + modules 区加模块卡片
- `nav.js` — `MODULE_RE` 加 `system-design`，`moduleInfo()` 加映射
- `footer.js` — `isDetailPage` 正则加 `system-design`
- `graph.html` — 加 CSS 变量 `--system-design`、legend 行、筛选 chip
- `architecture.html` — 加模块坐标 POS、层级归属（放在「3 分布式与运行时层」或独立一层「应用设计层」）

### 3. 更新文档
- `docs/module-node-spec.md` — 三级页面登记表新增 5 行

## 跨模块边（GRAPH_EDGES）

系统设计模块的核心价值是串联已有知识：

```
sd-short-url → hash, bplus, cache-layers, redis-types, lb
sd-rate-limiter → sliding-window, redis-types, redis-lock, lb, go-context
sd-distributed-id → redis-types, kafka-producer, go-atomic, consistent-hash
sd-push-system → kafka-overview, kafka-group, tcp, epoll, go-channel, go-patterns
sd-flash-sale → redis-lock, kafka-producer, cache-layers, go-context, lb, sliding-window
```

## 架构图定位

系统设计处于「应用设计层」，在分布式与运行时层和数据中间件层之间偏上的位置。它向下依赖 distributed、db、redis、kafka、network，向上被具体业务消费。

建议在 architecture.html 中的 POS 新增：
```js
'system-design': { x: 490, y: 535 }
```

并在 tiers 中把第 3/4 层之间加一条分界线或把系统设计归入第 3 层。

## 页面结构（C 类型 - 参考 distributed/raft.html）

每个系统设计页面的交互结构：
- **左侧面板**：场景切换标签（如「正常流程」「高并发」「故障恢复」）+ 步骤导航 dot
- **中间区域**：SVG 动画展示多组件交互流程（客户端、网关、缓存、数据库、队列等模块间的请求/响应流）
- **动画下方**：步骤说明文字
- **无右侧代码区**（C 类型可以没有代码面板，用文字和动画解释系统流程）

## 实施顺序

1. 先更新全局基础设施（`nav.js`、`footer.js`、`graph-data.js`、`index.html`、`graph.html`、`architecture.html`）
2. 创建 `system-design/index.html` 模块首页
3. 逐个实现 5 个 C 类型专题页面（先实现 `short-url.html` 作为模板，确认交互模式后复用到其余 4 个）
4. 更新 `docs/module-node-spec.md` 登记表
5. 验证星图、架构图、面包屑、返回路径等

## 工作量估计

- 全局基础设施更新：1 步完成
- 模块首页：1 步
- 每个 C 类型页面：内容较重，每个独立完成
- 文档更新：最后统一补

由于工作量较大（5 个完整的 C 类型动画页面），建议分步实施：本次先完成全局基础设施 + 模块首页 + 第一个专题页面 `short-url.html`，确认风格后再扩展其余 4 个。
