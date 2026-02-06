# Workspace 迁移扫描记录（apps/ + packages/）

日期：2026-02-06

本文记录一次对当前仓库 `apps/` 与 `packages/` 目录结构的快速扫描结果，用于与 [workspace-architecture.md](./workspace-architecture.md) 的目标形态对齐讨论。仅陈述观察点，不包含改动。

## 扫描范围

- `apps/`
  - `app/`（ToC Web）
  - `admin/`（ToB Web）
  - `app-api/`（ToC API）
  - `admin-api/`（ToB API）
- `packages/`
  - `shared/`
- 根与 workspace 配置
  - `pnpm-workspace.yaml`
  - 根 `package.json`

## 结构落地情况（与方案 A 的对应关系）

- 已采用 `apps/ + packages/` 的分层表达边界，且 workspace 已包含两者（`pnpm-workspace.yaml` 中包含 `packages/*`、`apps/*`）。
- 应用侧已经拆分为 ToC/ToB 两套 Web 与两套 API（`apps/app`、`apps/admin`、`apps/app-api`、`apps/admin-api`）。
- 共享侧已存在 `packages/shared`，并按 `contracts/domain/infra/adapter` 形成分层雏形。
- 命名上文档示例为 `apps/api`，当前为 `apps/app-api`；语义一致，仅名称不同。

## 观察点（仅记录）

### 1) ToC Web 内存在“管理态”路由/功能的痕迹

- `apps/app` 下存在 `routes/sys-manage`，以及对应的 `module/permission/role/user` 等页面与 feature。
- 这些能力更接近 ToB（管理后台）语义，可能是迁移前 ToC/ToB 语义尚未完全拆分时的遗留。

### 2) shared 的“多入口 exports”已建立，但边界仍依赖使用方自律/约束

- `packages/shared/package.json` 已通过 `exports` 暴露多入口（如 `./contracts/app/user`、`./domain/app/user`、`./postgresql` 等）。
- 同时 `packages/shared` 的运行时依赖包含 `@nestjs/*`、`pg`、`drizzle-orm` 等。
- 这意味着“物理上前端仍可安装到这些依赖”，实际是否发生污染主要取决于前端是否被约束只引用 `contracts` 入口（而不去引用 `adapter/infra` 相关出口）。

### 3) monorepo 的 packageManager 字段目前分散且版本不一致

- 根 `package.json` 未声明 `packageManager`。
- `apps/app`、`apps/app-api`、`apps/admin-api` 等子包分别声明了 `packageManager`，且版本不同。
- 与文档建议的“根作为唯一 pnpm 版本来源”存在差异，可能影响 lockfile 行为一致性与协作体验。

### 4) 根 package.json 存在运行时 dependencies

- 根 `package.json` 中存在 `dependencies`（例如 `lodash`、`zod`）。
- 文档建议倾向：运行时依赖由实际使用它的 workspace 包声明，根主要承载工具链 `devDependencies` 与版本收敛策略。
- 当前状态可能是历史遗留或刻意用于版本治理；后续讨论可明确其目的与边界。

## 可作为下一轮讨论的聚焦点

- ToC/ToB 语义边界：`apps/app` 中的 `sys-manage` 是否计划迁移/收敛到 `apps/admin`？
- shared 的依赖方向：是否要进一步强化“前端只能引用 contracts”的硬约束（例如仅暴露 contracts 子路径给前端、或用 lint/tsconfig paths 约束 import 路径）。
