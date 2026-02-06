# 拆包与重命名方案（contracts / persistence / nest-kit）

本文记录一套从 `@goi/shared` 逐步演进到多包结构的建议方案，目标是：

- 让“跨端契约”和“后端数据层/框架层”边界清晰，减少 shared 膨胀与污染。
- 保持导入路径稳定、开发期可源码导入、产物期可稳定运行。

## 现状与问题

`@goi/shared` 容易天然变成“什么都能放”的容器：

- 前端可能想用 contracts，但 shared 又包含 Nest/DB 相关内容会污染依赖。
- 后端为了复用会把 module/service/dto/tokens 也塞入 shared，导致文件分散、复杂度上升。

## 目标包划分

建议拆成三类包：

- `@goi/contracts`：跨端契约（类型 + 校验 schema + 可选 DTO 生成）
- `@goi/persistence`（或 `@goi/data`）：数据层（schema/query/repository/tokens）
- `@goi/nest-kit`：Nest 横切能力（异常/响应包装/权限基础设施）

### 依赖方向（必须单向）

- `@goi/contracts` 不依赖任何其他 workspace 包
- `@goi/persistence` 可以依赖 `@goi/contracts`，不依赖 `@goi/nest-kit`
- `@goi/nest-kit` 可以依赖 `@goi/contracts`，不依赖 `@goi/persistence`
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
- 可选：DTO 生成（如果希望 apps 内不再维护 dto 文件）

不放什么：

- drizzle/pg
- Nest module/service/controller

### @goi/persistence（或 @goi/data）

放什么：

- drizzle schema（表定义）
- query builders（分页/软删除/keyword 等复用片段）
- repository interface 与实现
- tokens（例如 `APP_USER_REPOSITORY` / `ADMIN_USER_REPOSITORY`）

不放什么：

- HTTP DTO / schema（避免与 contracts 边界混淆）
- Nest 业务 service/controller

命名建议：

- 更偏“数据层语义”选 `@goi/data`
- 更偏“持久化边界语义”选 `@goi/persistence`

### @goi/nest-kit

放什么：

- 通用异常（`BusinessException`）
- 全局异常过滤器（统一错误响应结构）
- 响应包装拦截器（统一输出 envelope）
- 权限相关基础设施（decorator/guard 的通用机制）
- 与 zod/contracts 的 Nest 适配（可选）

不放什么：

- drizzle/pg 与 repository 实现
- 具体业务权限数据来源（由 apps 提供）

## 导出层级建议（避免 exports 膨胀）

公开出口建议收敛到：

- 语义边界：`app/` 与 `admin/`
- 模块边界：`{feature}`（例如 `user`）

示例：

- `@goi/contracts/app/user`
- `@goi/contracts/admin/user`
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

### 阶段 3：拆出 @goi/persistence

- 将 drizzle schema/query/repository/tokens 迁入 `@goi/persistence`
- apps 通过 token 注入 repo 实现

### 阶段 4：抽出 @goi/nest-kit

- 将异常/响应包装/权限基础设施迁入 `@goi/nest-kit`
- apps 只做组装与业务实现

## 开发期源码导入与产物期运行

推荐保持导入路径稳定，在 dev/prod 解析到不同目标：

- dev：`tsconfig paths` 映射到 `packages/*/src/*`
- prod：通过 `package.json exports` 解析到 `dist/*`

具体方案参考：

- `docs/finances/workspace-wildcard-exports.md`
