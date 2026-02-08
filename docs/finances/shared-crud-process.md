# 共享 CRUD 生成流程（ToC/ToB 双 Repository + shared 只放定义）

本文沉淀一套“可重复执行”的流程，用于在 monorepo 中快速生成共享 CRUD 的骨架，并长期维持边界清晰。

核心思想是：

- `shared` 只承载定义：contracts / domain（repository 接口）/ infra（表与查询构件）/ tokens。
- `apps`（`app-api` 与 `admin-api`）各自保留 Nest 的模块开发体验：dto/service/controller/module，并各自注入各自的 repository。
- 从一开始就拆 ToC/ToB 两套 repository + token，以“类型与注入”双重隔离可见性与查询能力。

## 适用范围与不适用范围

适用：

- ToC 与 ToB 复用同一套表（schema），但对外可见字段、查询能力、路由语义不同。
- 希望 shared 不成为第二个应用层（避免 shared 提供 Nest adapter/service/module）。

不适用：

- ToC/ToB 完全同构且不会分叉（可以只保留一套 repo）。
- shared 需要承载可运行模块（例如必须复用 Nest module/service 的场景）。

## 目标目录约定（模板）

下面以 `user` 为例，模块名用 `{feature}` 表示：

```text
packages/shared/                       # 真实项目
  src/
    contracts/
      app/
        {feature}.ts                   # 领域对象与输入形状 + view 拆分
    domain/
      common/
        {feature}.types.ts             # PageResult/AuthUser/Values 等通用类型
      app/
        {feature}.repository.ts        # App{Feature}Repository
      admin/
        {feature}.repository.ts        # Admin{Feature}Repository
    infra/
      db/
        postgresql/
          schema/
            {feature}.table.ts         # drizzle schema（示意）
          queries/
            {feature}.query.ts         # 复用查询片段（可选）
    tokens/
      app/
        {feature}.tokens.ts            # APP_{FEATURE}_REPOSITORY
      admin/
        {feature}.tokens.ts            # ADMIN_{FEATURE}_REPOSITORY
      index.ts                         # 统一出口（re-export）

apps/app-api/
  src/modules/{feature}/
    {feature}.dto.ts
    {feature}.repository.ts            # Drizzle{Feature}Repository implements App{Feature}Repository
    {feature}.service.ts
    {feature}.controller.ts
    {feature}.module.ts                # bind APP token -> repo implementation

apps/admin-api/
  src/modules/{feature}/
    {feature}.dto.ts
    {feature}.repository.ts            # DrizzleAdmin{Feature}Repository implements Admin{Feature}Repository
    {feature}.service.ts
    {feature}.controller.ts
    {feature}.module.ts                # bind ADMIN token -> repo implementation
```

## Step 0：先定“共享边界”

在写任何文件前，先做两件事：

1. 定 contracts 的“对象”与“视图”

- `{Feature}`：领域对象的基础字段集合（通常对应表字段的公共子集）
- `App{Feature}View`：ToC 可见字段集合
- `Admin{Feature}View`：ToB 可见字段集合

建议：优先把“可见性差异”落到 `App/Admin View`，而不是通过 service 层临时裁剪。

2. 定 repository 的职责

- repository 只承载数据访问与持久化语义，不承载权限、路由、响应包装。
- app/admin 两套 repository 接口分别只暴露各自真正需要的方法与查询参数。

## Step 1：shared/contracts（定义对象与输入形状）

文件：`packages/shared/src/contracts/app/{feature}.ts`

最小产物：

- `{Feature}`（基础对象）
- `App{Feature}View`（ToC view）
- `Admin{Feature}View`（ToB view）
- `Create{Feature}`（创建输入形状）
- `Update{Feature}`（更新输入形状）

约束：

- contracts 不依赖 Nest，不依赖 DB（pg/drizzle），可依赖 zod（可选）。
- contracts 的目标是“前后端共识”，不要引入“管理端专用路由语义”的 DTO。

## Step 2：shared/domain/common（抽公共类型）

文件：`packages/shared/src/domain/common/{feature}.types.ts`

建议抽取：

- `PageResult<T>`
- `Auth{Feature}`（如果该 feature 有认证态字段）
- `{Create,Update}{Feature}Values`（用于 repo create/update 的输入）

目的：

- 避免 app/admin 两套 repository 文件重复定义同一套通用类型。

## Step 3：shared/domain/app 与 shared/domain/admin（两套 repository interface）

ToC：

- 文件：`packages/shared/src/domain/app/{feature}.repository.ts`
- 命名：`App{Feature}Repository`、`App{Feature}ListQuery`
- 返回：`App{Feature}View`

ToB：

- 文件：`packages/shared/src/domain/admin/{feature}.repository.ts`
- 命名：`Admin{Feature}Repository`、`Admin{Feature}ListQuery`
- 返回：`Admin{Feature}View`

约束：

- `App*` repository 不允许出现管理端查询字段（例如 `includeDeleted`、`keyword` 等）。
- 两套 interface 允许方法不对称：ToB 可以有更多查询/排序/筛选与管理动作相关的访问能力。

## Step 4：shared/tokens（两套 token + 统一出口）

文件：

- `packages/shared/src/tokens/app/{feature}.tokens.ts`
- `packages/shared/src/tokens/admin/{feature}.tokens.ts`
- `packages/shared/src/tokens/index.ts`（统一 re-export）

约定：

- ToC 与 ToB token 必须不同（避免注入绑错实现）。
- token “定义”跟随模块放置；“导出”通过统一入口提升可发现性。

## Step 5：shared/infra/db（统一表定义 + 可复用查询片段）

表定义：

- `packages/shared/src/infra/db/postgresql/schema/{feature}.table.ts`

可复用查询片段（可选）：

- `packages/shared/src/infra/db/postgresql/queries/{feature}.query.ts`
- 只放与“数据访问”相关的纯函数（例如 where 组合、分页参数 normalize、软删除过滤、keyword 搜索片段等）。

约束：

- infra 可以依赖 drizzle/pg，但不要引入 Nest。
- infra 的查询片段应支持 app/admin 两套 repo 实现共享，但不强迫两套 repo 变成同构。

## Step 6：apps/app-api：生成 ToC 模块四件套 + repo 实现

目录：`apps/app-api/src/modules/{feature}/`

必需文件：

- `{feature}.dto.ts`：入口 DTO（薄），尽量复用 contracts 类型
- `{feature}.repository.ts`：实现 `App{Feature}Repository`（drizzle 查询）
- `{feature}.service.ts`：注入 `APP_{FEATURE}_REPOSITORY`，承载 ToC 语义编排
- `{feature}.controller.ts`：HTTP 路由与权限装配
- `{feature}.module.ts`：`provide APP token -> useClass repo impl` + providers/controllers

约束：

- service/controller 归属应用，承载权限、路由语义、响应封装等“产品语义”。
- app-api 不引用 admin repository/token。

## Step 7：apps/admin-api：生成 ToB 模块四件套 + repo 实现

目录：`apps/admin-api/src/modules/{feature}/`

必需文件同 ToC，但 repo 实现与注入改为 Admin：

- `{feature}.repository.ts`：实现 `Admin{Feature}Repository`
- `{feature}.service.ts`：注入 `ADMIN_{FEATURE}_REPOSITORY`
- `{feature}.controller.ts`：ToB 路由与权限
- `{feature}.module.ts`：绑定 `ADMIN token -> repo impl`

## 最终检查清单（生成后快速自检）

- `shared` 内没有出现 Nest 依赖（controller/module/service/exception 等）。
- contracts 中存在 `App*View` 与 `Admin*View`（可见性差异落地）。
- domain 中存在 `App*Repository` 与 `Admin*Repository` 两份接口与 Query。
- tokens 中存在 APP/ADMIN 两个 token，并且有统一出口导出。
- app-api 与 admin-api 各自实现自己的 repo，并绑定到各自 token。
- app-api 不 import admin repo/token；admin-api 不 import app repo/token。
