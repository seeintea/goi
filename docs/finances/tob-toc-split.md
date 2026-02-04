## ToC / ToB 拆分与共享层方案（finances）

### 背景

当前 `packages/finances`（前端）与 `packages/finances-api`（后端）在开发过程中混入了较多 ToB（后台）常见能力（权限管理、角色管理、路由/菜单管理等）。这会导致：

- ToC 产品承载后台的复杂度，影响迭代速度与体验
- 权限语义混乱（用户态 vs 管理员态），容易出现越权与审计缺失
- 后续补齐 ToB 能力时，需要在 ToC 代码路径中不断打补丁

本文沉淀一套拆分原则与落地方式：前端 ToB/ToC 拆开；后端拆成 ToC API + Admin API，并通过共享库复用领域能力，避免复制代码分叉。

### 目标

- ToC 迭代更快：保持用户态接口与路由简单
- ToB 能支撑运营：以管理员语义提供管理/配置能力（含配置 ToC 权限）
- 复用业务能力：共享领域/数据访问层，而不是共享 ToC 的应用层
- 可渐进增强：早期可弱鉴权/单人本地开发，后期可平滑补齐 RBAC/数据权限/审计

### 拆分结论

- 前端：ToC App 与 ToB Admin App 分离
- 后端：拆出两个可运行应用（服务）
  - `finances-api`：ToC（用户态）API
  - `finances-admin-api`：ToB（管理员态）API
- 共享：以“库（libs/packages）”形式共享领域能力，不新增一个 `finances-share-api` 这种第三个对外 HTTP 服务作为共享手段

### 核心原则（避免拆完更糟）

- 共享“能力”，不共享“入口”
  - 能力：领域服务/用例、repository、领域模型、通用错误码与校验
  - 入口：Controller、路由、Swagger 装饰器、用户态 Guard、响应序列化策略等应留在各自应用内
- 不复制领域代码
  - 复制最多只发生在入口层（例如把一组 ToB controller 迁到 admin 应用）
  - 领域逻辑与数据访问应下沉到共享库，由两个应用通过依赖注入复用
- 权限语义分离
  - ToC：用户自己能做的事
  - ToB：管理员替别人做的事（含批量/跨用户/跨组织操作）

### API 边界约定

- ToC API 以用户态为中心
  - 示例：`/c/*`（前缀可自定）
  - 默认行为：仅访问“当前用户可见”的数据，按体验需要做字段脱敏与简化
- ToB/Admin API 以管理员态为中心
  - 示例：`/admin/*` 或 `/b/*`
  - 支持：按 `targetUserId` / 租户 / 组织维度管理与配置
  - 管理写操作必须具备：`operatorId`、目标对象标识与审计信息

### ToB 是否可以直接调用 ToC 接口？

不建议让 ToB “直接调用 ToC 对外接口” 来做权限配置或跨用户操作。原因：

- ToC 接口通常内建“用户态”假设（只能操作自己的资源）
- 需要引入大量后门参数（`userId` / `force` / `batch`）会污染 ToC API
- 越权与审计链路难以收口（“是谁改的”不清晰）

推荐做法：

- ToB 通过 Admin API 直接操作“授权数据”（角色/权限绑定、数据范围规则等）
- ToC 在鉴权时读取/缓存同一份授权数据，实现一致的访问控制

### NestJS 下的共享方式（应用层 vs 共享层）

在 NestJS 中推荐使用“两个应用 + 多个共享库”的结构：

- `finances-api` / `finances-admin-api`
  - 各自拥有自己的 `AppModule`、Controller、Guard、Interceptor、DTO 映射与响应策略
- 共享库（示例命名，仅表达边界）
  - `finances-domain`：领域模型、领域服务、用例（不依赖 HTTP 上下文）
  - `finances-data`：repository/ORM 适配、实体映射、事务等
  - `finances-common`：通用类型、错误码、纯函数工具、校验
  - 可选 `finances-auth`：通用的 token 校验、claims 解析、鉴权策略的可复用片段（ToC/ToB 仍各自组合 guard）

应用如何“调用共享库”：

- 纯代码（类型/工具/纯函数）：直接 import
- 可注入能力（service/repository）：共享库提供 `@Module()` 导出 providers，两个应用在各自模块中 `imports` 后通过构造函数注入使用

### 鉴权与审计策略（可渐进）

早期（单用户/本地开发）可先弱化 ToB 鉴权，但建议从第一天就固定概念与字段：

- ToC：user token（用户态）
- ToB：operator token（管理员态）
- Admin 写操作审计最少包含：
  - `operatorId`
  - `action`（做了什么）
  - `target`（对谁/对什么资源）
  - `timestamp` 与必要的 payload 摘要

后期增强：

- ToB：RBAC（角色-权限-菜单/模块）、数据范围（组织/账本/资源维度）
- ToC：尽量保持轻模型，只读取授权结果，不承载后台配置复杂度

### 迁移/落地步骤（最小成本）

1. 前端拆分：ToC App 与 ToB Admin App 独立
2. 后端新增 `finances-admin-api`（或从现有代码迁出）
3. 约定接口前缀与语义：ToC `/c/*`，Admin `/admin/*`（或 `/b/*`）
4. 下沉共享层：把“领域服务/用例 + repository”抽到共享库，两个应用复用
5. ToB 权限配置走 Admin API：写入授权数据；ToC 鉴权读取授权数据
6. 再评估是否需要更重的隔离：独立部署、独立数据库、网关策略等

### 反模式（尽量避免）

- 为了共享而新增一个 share-api 服务（HTTP），导致分布式复杂度上升
- 复制一份 ToC 后端代码给 ToB，形成两套领域逻辑与双维护
- 在 ToC API 中不断加入管理员后门参数以满足后台需求
- 把菜单/路由/模块配置等后台能力塞进 ToC 的核心路径

