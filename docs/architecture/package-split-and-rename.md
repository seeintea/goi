# 拆包与重命名方案（contracts / infra / nest-kit / persistence）

本文记录一套从 `@goi/shared` 逐步演进到多包结构的建议方案，目标是：

- 让“跨端契约”和“后端数据层/框架层”边界清晰，减少 shared 膨胀与污染。
- 保持导入路径稳定、开发期可源码导入、产物期可稳定运行。

## 现状与问题

`@goi/shared` 容易天然变成“什么都能放”的容器：

- 前端可能想用 contracts，但 shared 又包含 Nest/DB 相关内容会污染依赖。
- 后端为了复用会把 module/service/dto/tokens 也塞入 shared，导致文件分散、复杂度上升。

## 目标包划分

建议拆成三类包（可选第四类）：

- `@goi/contracts`：跨端契约（类型 + 校验 schema + 可选 DTO 生成）
- `@goi/infra`：基础设施接入与技术复用（db/redis clients、事务、通用查询片段）
- `@goi/nest-kit`：Nest 横切能力（异常/响应包装/权限基础设施）
- `@goi/persistence`（可选）：业务数据访问层（当需要共享 repo/数据访问契约时引入）

### 依赖方向（必须单向）

- `@goi/contracts` 不依赖任何其他 workspace 包
- `@goi/infra` 可依赖 `@goi/contracts`（可选），不依赖 `@goi/nest-kit`
- `@goi/nest-kit` 可以依赖 `@goi/contracts`，可依赖 `@goi/infra`
- `@goi/persistence`（若存在）可以依赖 `@goi/contracts`，可以依赖 `@goi/infra`，不依赖 `@goi/nest-kit`
- `apps/*` 可依赖三者任意组合

这条约束的目的：

- 前端只依赖 `@goi/contracts` 时不会被 Nest/pg/drizzle 污染
- 避免包间循环依赖

## 各包职责边界

### @goi/contracts

放什么：

- `contracts/app/*` 与 `contracts/admin/*`：ToC/ToB 分叉契约
- 类型（`User`、`CreateUser`、`AppUserView`、`AdminUserView`）
- zod schema（Create/Update/ListQuery/Response）

不放什么：

- drizzle/pg
- Nest module/service/controller

说明：

- contracts 只承载“契约单一事实来源”（schema + types），不引入 `nestjs-zod`。
- API 层 DTO 的 Nest 适配交给 `@goi/nest-kit`（见下文）。

### @goi/infra

放什么：

- PostgreSQL/Redis 等外部资源的 client 初始化与复用封装
- drizzle schema（表定义）与 schema 聚合
- 通用 query helpers（分页 normalize、软删除过滤、keyword builder 等）
- 事务与连接生命周期相关的技术封装

不放什么：

- HTTP DTO / schema（避免与 contracts 边界混淆）
- 任何具体业务的 repository（User/Book/Role...）
- Nest 业务 service/controller

### @goi/nest-kit

放什么：

- 通用异常（`BusinessException`）
- 全局异常过滤器（统一错误响应结构）
- 响应包装拦截器（统一输出 envelope）
- 权限相关基础设施（decorator/guard 的通用机制）
- contracts 的 Nest 适配（使用 `nestjs-zod` 将 schema 转成 DTO class）
- 基础设施的 Nest 装配模块（例如将 `@goi/infra` 提供的 db/redis client 注入 Nest）

不放什么：

- drizzle/pg 的业务查询与 repository 实现
- 具体业务权限数据来源（由 apps 提供）

### @goi/persistence（可选）（或 @goi/data）

定位：

- 当需要“跨 app/admin 共享业务数据访问层（repo）”或“强制能力边界”时引入
- 若目标是尽量保持业务灵活，可不引入 persistence，仅用 `@goi/infra` 提供 schema 与 query helpers

放什么：

- repository（可选：interface、实现类、query service 等）
- 数据访问的模块级聚合（当需要为 apps 提供更高层复用时）

不放什么：

- HTTP DTO / schema
- Nest 业务 service/controller

## 导出层级建议（避免 exports 膨胀）

公开出口建议收敛到：

- 语义边界：`app/` 与 `admin/`
- 模块边界：`{feature}`（例如 `user`）

示例：

- `@goi/contracts/app/user`
- `@goi/contracts/admin/user`
- `@goi/infra/postgresql`
- `@goi/infra/redis`
- `@goi/persistence/app/user`
- `@goi/persistence/admin/user`
- `@goi/persistence/tokens/app`
- `@goi/persistence/tokens/admin`

exports 配置建议使用通配符（subpath pattern），避免随着模块数量线性增长。可参考文档：

- `docs/finances/workspace-wildcard-exports.md`

## 迁移策略（最小成本）

建议分阶段推进：

### 阶段 1：先“语义拆分”而不动目录

- 保留现有 `packages/shared` 的物理目录
- 在内部约定上把内容分成三块：contracts / persistence / nest-kit
- 新增导出入口与路径，让新增代码优先走新边界（旧边界不强制立刻迁移）

### 阶段 2：拆出 @goi/contracts（优先级最高）

- 将前后端共享的 types/schema 迁入 `@goi/contracts`
- 前端改为只依赖 `@goi/contracts`（切断 shared 污染）

### 阶段 3：拆出 @goi/infra

- 将 db/redis 的 client 初始化、drizzle schema、query helpers 迁入 `@goi/infra`
- 将 “Nest 装配（Module/Provider/Service）” 迁入 `@goi/nest-kit` 并依赖 `@goi/infra`

### 阶段 4：抽出 @goi/nest-kit

- 将异常/响应包装/权限基础设施迁入 `@goi/nest-kit`
- apps 只做组装与业务实现

### 阶段 5（可选）：引入 @goi/persistence

- 当明确需要跨 app/admin 复用业务数据访问层时，再将 repo 聚合迁入 `@goi/persistence`
- 若不需要强制约束，业务可继续在各自 apps 的 service 层直接使用 `@goi/infra` 的 db/schema/query helpers

## 开发期源码导入与产物期运行

推荐保持导入路径稳定，在 dev/prod 解析到不同目标：

- dev：`tsconfig paths` 映射到 `packages/*/src/*`
- prod：通过 `package.json exports` 解析到 `dist/*`

具体方案参考：

- `docs/finances/workspace-wildcard-exports.md`
