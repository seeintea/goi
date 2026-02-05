# Monorepo 架构讨论落库（ToC/ToB/RN + Shared 分层）

本文记录当前仓库的 Monorepo 结构讨论结论，用于后续落地时对齐边界与依赖方向。

## 背景

- 仓库当前 `packages/` 下存在多个以 `finances-` 开头的包，属于早期随意命名；但实际整仓就是“个人财务管理”的各模块。
- 当前仓库形态是 pnpm workspace（见 `pnpm-workspace.yaml`），包含：
  - Web（Vite SPA）：`packages/finances`
  - API（Nest）：`packages/finances-api`
  - DB 与共享：`packages/finances-db`、`packages/finances-shared`
- 后续规划：ToC Web、ToC API、ToB Admin Web、ToB Admin API，以及 RN App（与 Web 共用同一套后端 API）。

## 目标

- 明确 ToC / ToB 的边界，避免“用户态产品混入管理态复杂度”。
- 明确 `apps` 与 `packages` 的职责：可运行应用与可复用库分离。
- 共享层可复用但不“变成大杂烩”：对外入口统一，对内分层隔离依赖。
- 为 RN 接入留出结构空间：跨端优先共享契约（contracts）而不是共享 UI 或后端实现。

## 目标目录结构（方案 A）

采用“应用（apps）+ 库（packages）”的结构表达边界。

```text
apps/
  app/                # ToC Web（浏览器）
  admin/              # ToB Web（管理后台）
  api/                # ToC API（Nest）
  admin-api/          # ToB API（Nest）
  app-rn/             # ToC RN（可选，后加）

packages/
  shared/             # 共享命名空间（对外统一入口，对内分层导出）
  utils/              # 通用工具函数（纯工具，无框架依赖）
```

## packages/shared：内部分层导出

shared 的设计目标是“统一入口 + 严格分层”，让不同消费者只能使用自己该用的能力，避免前端误引入后端依赖（Nest/pg/drizzle）。

### shared 的定位（B1：源码直引，后端复用优先）

当前阶段 shared 不作为独立 npm 包发布，优先采用 B1（在 monorepo 内直接引用 shared 源码）来提升开发体验与复用效率。shared 的首要价值是服务后端复用：让 `api` 与 `admin-api` 共用同一套库表（drizzle schema）与 repository 实现，避免重复代码与不一致。

- 后端优先复用（建议优先落地）
  - 复用 drizzle schema（库表/relations/枚举）与 repository 的 DB 实现
  - 两个 API 复用同一套 infra 层实现，controller/路由语义仍保持 ToC/ToB 拆分
- contracts 仍保留（可渐进使用）
  - contracts 的目的仍是统一前后端契约，但它不是 shared 的唯一目标；允许逐步替换当前 Web 内部重复定义的类型

推荐分为四层：

- contracts（契约层）
  - 内容：DTO/Schema、分页结构、错误码、响应结构等“前后端共识”
  - 依赖：不依赖 Nest；不依赖 drizzle/pg；可依赖 zod 或纯 TS 类型
  - 消费者：Web / RN / ToC API / ToB API
- domain（领域层）
  - 内容：业务规则、用例、Repository 接口（ports）、领域错误（与框架无关）
  - 依赖：不依赖 Nest；不依赖数据库实现
  - 消费者：ToC API / ToB API（Web/RN 仅在需要复用纯业务逻辑时使用）
- infra（基础设施层）
  - 内容：drizzle schema、repository 的 DB 实现、与外部系统交互实现
  - 依赖：可依赖 drizzle/pg/redis 等，但不引入 Nest 的胶水
  - 消费者：ToC API / ToB API（前端不可依赖）
- adapter（适配层）
  - 内容：Nest Module/Provider、框架胶水、将 domain/infra 装配到 Nest 的 wiring
  - 依赖：允许依赖 Nest
  - 消费者：ToC API / ToB API（前端不可依赖）

对外导出建议（概念层面）：

- `shared/contracts/*`：Web/RN/API 共用
- `shared/domain/*`：API 共用（Web/RN 可选）
- `shared/infra/*`：API 专用
- `shared/adapter/*`：API（Nest）专用

### shared 的实现形态：单包多入口 vs 多包

shared 的“contracts/domain/infra/adapter”分层是边界语义，并不强制要求拆成四个 workspace 包。推荐在早期采用“单包多入口”，在规模变大后再考虑升级为“多包强隔离”。

- 形态 1：一个 shared 包，一个 `package.json`，对外多入口导出（推荐默认）
  - 目录：`packages/shared/*`
  - 对外：通过 exports 子路径暴露多个入口（例如 `shared/contracts/*`、`shared/domain/*` 等）
  - 优点：包数量少、版本统一、维护成本低；同时用入口约束依赖边界（前端默认只能引用 contracts）
- 形态 2：四个独立 workspace 包（四个 `package.json`）
  - 目录：`packages/shared-contracts`、`packages/shared-domain`、`packages/shared-infra`、`packages/shared-adapter`
  - 优点：物理隔离最强，依赖不易串；适合团队变大、边界经常被破坏的阶段
  - 代价：包数量增加，开发/发布/依赖治理成本更高

### shared 的子域划分（推荐）

在 `contracts/domain/infra/adapter` 四层之下，再按“业务子域”落一层，优先覆盖现有能力：identity（user+auth）、book（book+book-member）、rbac（sys 管理域），以及 common（跨域通用）。

推荐目录形态（单包多入口）：

```text
packages/shared/
  contracts/
    common/
    identity/
    book/
    rbac/
  domain/
    common/
    identity/
    book/
    rbac/
  infra/
    db/
      identity/
      book/
      rbac/
    cache/
      identity/
  adapter/
    nest/
      common/
      identity/
      book/
      rbac/
```

子域归层口径：

- common（跨域）
  - contracts：分页/列表查询结构、错误码、通用响应结构等
  - domain：通用领域错误（可选）
- identity（user + auth）
  - contracts：Login / LoginResponse、User 相关 DTO/Schema/类型（Web/RN/API 共用）
  - domain：UserRepository 等 ports、认证与用户用例的纯业务规则
  - infra：UserRepository 的 drizzle 实现、token 存储（如 redis）实现
  - adapter：Nest module/provider、ZodDto 与 swagger 等框架胶水
- book（book + book-member）
  - contracts：Book/BookMember DTO/Schema/类型
  - domain：账本与成员协作规则、BookRepository/BookMemberRepository ports
  - infra：drizzle schema + repository 实现
  - adapter：Nest wiring 与 controller 所需装配
- rbac（module/permission/role/role-permission）
  - contracts：管理域 CRUD 的 DTO/Schema/类型
  - domain：权限模型与规则、RBAC 用例与 ports
  - infra：`sys_*` drizzle schema + repository 实现
  - adapter：仅用于管理态 API 的 Nest 装配

引用约束（用“层 + 子域”防止 ToC/ToB/RN 污染）：

- Web（ToC/ToB）与 RN：只允许引用 `shared/contracts/**` + `packages/utils/**`
- ToC API：允许引用 `contracts + domain + infra + adapter`，但只暴露 ToC 语义路由（identity/book）
- ToB API：允许引用 `contracts + domain + infra + adapter`，并额外暴露管理域路由（rbac 等）

## ToC / ToB 模块划分（以现有模块为参照）

以当前后端模块为参照，可按“语义”划分：

- ToC API（apps/api）应包含
  - auth（登录注册、token）
  - book（账本）
  - book-member（协作成员）
  - user（用户自服务）
- ToB API（apps/admin-api）应包含
  - module（菜单/模块）
  - permission（权限配置）
  - role（角色）
  - role-permission（角色权限关系）
  - user（用户管理视角：封禁/重置等管理动作，若需要）

核心约束：

- domain/infra 可以复用（同一业务子域的规则与数据访问复用）
- controller/路由必须拆分（ToC 不引入 ToB 的管理态路由与语义）

## 依赖矩阵（强约束）

- apps/app（ToC Web）
  - 允许：`packages/shared/contracts`、`packages/utils`
  - 禁止：`shared/infra`、`shared/adapter`、任何 `@nestjs/*`、任何 `pg/drizzle` 相关
- apps/app-rn（ToC RN）
  - 同 ToC Web：优先复用 `contracts + utils`，避免引入 Node/Nest/DB 依赖
- apps/admin（ToB Web）
  - 允许：`contracts + utils`
  - 禁止：任何 infra/adapter
- apps/api（ToC API）
  - 允许：`contracts + domain + infra + adapter + utils`
- apps/admin-api（ToB API）
  - 同 ToC API，但仅暴露管理态路由与语义

## 根 package.json 的依赖放置原则

在 pnpm monorepo 下，“依赖安装位置共享”与“依赖声明归属”需要分开理解。推荐的放置原则：

- 根 devDependencies（推荐）
  - 全仓通用的工具链与开发依赖：lint/format/typecheck、脚手架/生成器、commit 工具、测试工具等
  - 目的：统一工具版本，降低重复配置与升级成本
- 根 dependencies（一般不建议）
  - 容易成为子包的“隐式依赖来源”，导致某个子包未声明依赖但本地能跑；在过滤安装、单包构建/部署、CI 环境下容易缺依赖
  - 运行时依赖应由实际使用它的 workspace 包在自己的 `dependencies`/`peerDependencies` 中声明
- 例外
  - 若根本身需要作为可运行产物（例如根目录也发布/运行一个服务或 CLI），则根可以拥有自己的 dependencies
  - 根也可以承担版本治理（统一 React/Nest 等版本），但这不等于替子包声明运行时依赖

## 依赖提升与版本治理（pnpm workspace）

- “安装位置共享”与“依赖声明归属”需要区分：
  - pnpm 可以把依赖提升/复用到仓库层，但每个 workspace 包仍应声明自己运行时所需依赖，避免单包构建/部署时缺依赖。
- 根 `package.json` 更适合承载：
  - 工具链（lint/format/typecheck）、版本约束策略（统一 React/Nest 版本）
  - 不建议把运行时依赖当作“隐式来源”，否则边界会模糊。
- workspace 内 `packageManager` 建议统一为同一 pnpm 版本，避免 lockfile/行为差异。

### 根统一版本约束（推荐做法）

目标：各子包独立声明依赖归属，但全仓最终安装出来的版本保持一致，避免 React/Nest 出现多版本或不兼容组合。

- 方式：在根配置 pnpm 的版本收敛规则（例如 overrides）
  - 用于强制全仓 `react/react-dom`、`@nestjs/*`、`zod` 等依赖解析到指定版本
  - 这不替代子包声明依赖：子包仍需要在自己的 `dependencies`/`peerDependencies` 写清楚“我用什么”
- 使用边界
  - 默认优先收敛“全仓通用且必须统一”的依赖（例如 React、Nest 核心包）
  - 避免过度一刀切；当确实存在不同版本需求时，应缩小约束范围或拆分能力边界

### React 等单例依赖的治理建议

React（以及 RN 场景下的 react-native）属于“运行时必须单例”的依赖。monorepo 下如果装出两份 React，常见表现是 hooks 报错、Context 不互通、状态异常。建议采用以下治理方式：

- 应用包提供运行时依赖
  - apps/app、apps/admin、apps/app-rn 等应用将 `react/react-dom`（或 `react-native`）声明在 `dependencies`
- 库包避免自带 React
  - packages/shared、packages/utils 等库包仅在确实需要 import React 运行时能力时，使用 `peerDependencies` 声明 React 兼容范围
  - 若库包不依赖 React，则不声明 `react` 相关依赖
- 版本收敛配合使用
  - 根使用版本治理（例如 overrides）将全仓最终解析到同一 React 版本，降低“双 React”风险

### packageManager 的放置约定

在 monorepo 场景中建议以根为唯一来源：

- 根 `package.json` 声明 `packageManager` 锁定 pnpm 版本
- 子包不再重复声明 `packageManager`，避免出现多个 pnpm 版本字段不一致导致的行为差异与困惑
- 若某个子包未来会脱离 monorepo 成为独立仓库，再考虑在该包单独声明

## RN 共享策略

优先级建议：

1. contracts 共享（最高价值、最低风险）
2. api-client 共享（可选；保持跨端实现，避免引入后端 infra/adapter）
3. domain 纯业务逻辑共享（谨慎；仅限无框架/无运行时耦合的部分）
4. UI 不强行共享（Web 与 RN 组件体系差异大，早期强共享会拖慢迭代）

## 落地顺序（建议）

1. 新增 ToB Web / ToB API 时，先把目录与依赖边界放对（apps 与 packages 分离）。
2. shared 先“分层清晰、依赖方向固定”，最后再决定是否物理合并/统一命名。
3. 边界稳定后，再做目录重命名、包名重命名（这是全仓影响最大的步骤，放后面更稳）。
