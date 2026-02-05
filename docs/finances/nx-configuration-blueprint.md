# Nx 配置蓝图（建议在完成 workspace 改造后落地）

本文给出本仓库引入 Nx 时的推荐配置形态（文件结构、核心字段、target 设计、缓存/affected/边界治理），用于你在完成 `apps/*` + `packages/*` 改造后按图施工。

## 前置假设

```text
apps/
  app/        # ToC Web（Vite）
  admin/      # ToB Web（Vite）
  api/        # ToC API（Nest）
  admin-api/  # ToB API（Nest）
  app-rn/     # ToC RN（Expo/Metro）

packages/
  shared/
  utils/
```

包管理仍由 pnpm-workspace 负责；Nx 负责任务编排、缓存、affected 与约束治理。

## 1) 根目录文件：Nx 最小落地集合

引入 Nx 后，仓库根通常新增/维护以下文件：

- `nx.json`：Nx 的全局配置（project 布局、默认 target 行为、缓存 inputs、plugins 等）
- `apps/*/project.json`、`packages/*/project.json`：每个项目的 targets 定义
- `package.json`：增加少量 scripts 作为入口（例如 `nx`/`nx run-many`）

## 2) nx.json（全局配置建议）

下面是建议结构（示例字段仅用于表达意图）：

```json
{
  "$schema": "./node_modules/nx/schemas/nx-schema.json",
  "defaultBase": "main",
  "workspaceLayout": {
    "appsDir": "apps",
    "libsDir": "packages"
  },
  "namedInputs": {
    "default": ["{projectRoot}/**/*", "sharedGlobals"],
    "production": [
      "default",
      "!{projectRoot}/**/*.spec.*",
      "!{projectRoot}/**/*.test.*",
      "!{projectRoot}/**/*.md",
      "!{projectRoot}/**/.storybook/**"
    ],
    "sharedGlobals": [
      "{workspaceRoot}/package.json",
      "{workspaceRoot}/pnpm-lock.yaml",
      "{workspaceRoot}/pnpm-workspace.yaml",
      "{workspaceRoot}/tsconfig.base.json",
      "{workspaceRoot}/biome.json"
    ]
  },
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["production"],
      "cache": true
    },
    "lint": {
      "inputs": ["default"],
      "cache": true
    },
    "typecheck": {
      "inputs": ["default"],
      "cache": true
    },
    "test": {
      "inputs": ["default"],
      "cache": true
    },
    "dev": {
      "cache": false
    }
  }
}
```

要点：

- `workspaceLayout` 对齐 `apps/*` 与 `packages/*`
- `namedInputs` 决定“什么变更会导致缓存失效”，建议把 lockfile、tsconfig、lint 配置等纳入全局输入
- `targetDefaults.build.dependsOn=["^build"]` 让 build 按依赖图自动串起来
- `dev` 通常不缓存（更符合开发预期）

## 3) project.json（每个项目的 targets）

Nx 推荐每个项目有独立的 `project.json`，以“一个项目一份 targets 契约”方式统一管理命令。

### 3.1 Web（Vite）项目：apps/app、apps/admin

建议 targets：

- `dev`：vite dev
- `build`：vite build
- `lint`：biome lint（或项目内 lint 命令）
- `typecheck`：tsc -p

示例（概念）：

```json
{
  "name": "app",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "apps/app/src",
  "projectType": "application",
  "targets": {
    "dev": { "command": "pnpm -C apps/app dev" },
    "build": { "command": "pnpm -C apps/app build", "outputs": ["{projectRoot}/dist"] },
    "lint": { "command": "pnpm -C apps/app lint" },
    "typecheck": { "command": "pnpm -C apps/app tsc -p tsconfig.json --noEmit" }
  }
}
```

### 3.2 API（Nest）项目：apps/api、apps/admin-api

建议 targets：

- `dev`：nodemon/ts-node 启动（策略 B 下直接引用 shared 源码）
- `build`：tsc build
- `lint`、`typecheck`

示例（概念）：

```json
{
  "name": "api",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "apps/api/src",
  "projectType": "application",
  "targets": {
    "dev": { "command": "pnpm -C apps/api dev" },
    "build": { "command": "pnpm -C apps/api build", "outputs": ["{projectRoot}/dist"] },
    "lint": { "command": "pnpm -C apps/api lint" },
    "typecheck": { "command": "pnpm -C apps/api tsc -p tsconfig.json --noEmit" }
  }
}
```

### 3.3 RN（Expo/Metro）项目：apps/app-rn

建议 targets：

- `dev`：expo start
- `build`：根据 RN 策略（可先不定义或定义为 release build）
- `lint`、`typecheck`

示例（概念）：

```json
{
  "name": "app-rn",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "apps/app-rn/src",
  "projectType": "application",
  "targets": {
    "dev": { "command": "pnpm -C apps/app-rn dev" },
    "lint": { "command": "pnpm -C apps/app-rn lint" },
    "typecheck": { "command": "pnpm -C apps/app-rn tsc -p tsconfig.json --noEmit" }
  }
}
```

### 3.4 libs：packages/shared、packages/utils

在策略 B 下，libs 的 `dev` 目标通常不是必需的（因为 Web/RN 直接吃源码）；但 `build/typecheck` 仍然很有价值（发布、CI、类型兜底）。

建议 targets：

- `build`：输出 dist/types（用于发布与 CI）
- `typecheck`：noEmit
- `lint`

示例（概念）：

```json
{
  "name": "shared",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "packages/shared/src",
  "projectType": "library",
  "targets": {
    "build": { "command": "pnpm -C packages/shared build", "outputs": ["{projectRoot}/dist"] },
    "lint": { "command": "pnpm -C packages/shared lint" },
    "typecheck": { "command": "pnpm -C packages/shared tsc -p tsconfig.json --noEmit" }
  }
}
```

## 4) 场景命令（与你的日常需求对齐）

建议把“场景”固化成 Nx 的 run-many 或自定义聚合 target：

- 启动全部项目（开发）
  - `nx run-many -t dev --all --parallel`
- 仅开发 admin（含依赖的约束由策略 B 的源码直引 + 依赖图提供）
  - `nx dev admin`
- 仅开发 app
  - `nx dev app`
- 仅开发 rn
  - `nx dev app-rn`

可选：提供聚合脚本（ToC/ToB 一键）：

- `nx run-many -t dev -p app api --parallel`
- `nx run-many -t dev -p admin admin-api --parallel`

## 5) affected（只跑受影响项目）

在 CI 中推荐使用：

- `nx affected -t lint`
- `nx affected -t typecheck`
- `nx affected -t test`
- `nx affected -t build`

策略 B 的关键收益：修改 `packages/shared/contracts/**` 时，只会影响依赖它的 app/admin/app-rn（以及可能的 api），避免全仓重跑。

## 6) 缓存（本地/远程）

建议默认对 `build/lint/typecheck/test` 启用缓存，对 `dev` 禁用缓存。

远程缓存可在团队规模或 CI 压力上来后再启用，优先确保：

- `namedInputs` 覆盖了会影响产物的全局文件（锁文件、tsconfig、lint 配置）
- 每个 `build` 有明确 outputs（dist、build artifacts）

## 7) 边界治理（与 shared 分层一致）

Nx 引入后建议逐步增加“依赖边界”检查，把架构约束自动化：

- Web/RN 只能依赖 `shared/contracts` 与 `utils`
- API 才能依赖 `shared/infra` 与 `shared/adapter`

实现手段通常是 ESLint/biome 规则 + Nx project tags 组合（先落地 tags 与规则，再逐步收紧）。

## 8) 渐进落地顺序（推荐）

1. workspace 目录改造完成（apps/packages 稳定）
2. Nx 最小可用（nx.json + 每项目 project.json + 基础 targets）
3. CI 切到 `nx affected`（先 lint/typecheck，再 build/test）
4. 缓存调优（inputs/outputs 补全）
5. 边界治理（tags + 规则）
