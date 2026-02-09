# Nx 深入配置指南（从 0 到可落地）

本文面向第一次引入 Nx 的场景，目标是让你理解 Nx 的配置“为什么这么配、怎么配、配错会怎样”。内容以本仓库未来的目录形态（`apps/*` + `packages/*`）与策略 B（共享库源码直引）为前提。

## 0. 关键结论（先给方向）

- pnpm-workspace 管安装与 workspace 包发现；Nx 管“任务编排 + 依赖图 + 缓存 + affected + 约束治理”。
- Nx 的核心是把每个项目的任务变成“纯函数”：输入确定、输出确定，从而缓存与 affected 才准确。
- 策略 B 下，`dev` 不再依赖 `shared:build`；HMR/热更新交给 Vite/Metro/nodemon，Nx 只负责统一入口与受影响运行。

## 1. Nx 的核心对象：Project / Target / Task / Graph

- Project：Nx 识别的“项目单元”，通常对应一个 app 或一个 lib。
- Target：项目可执行的任务集合，如 `dev/build/lint/typecheck/test`。
- Task：一次执行实例，如 `admin:build`。
- Project Graph：项目之间的依赖图，是 Nx 编排与 affected 的基础。

你可以把 Nx 理解为：先构建依赖图，再按依赖图执行 targets，并基于 inputs/outputs 做缓存与受影响计算。

## 2. Nx 全局配置：nx.json（仓库级政策文件）

Nx 的 `nx.json` 主要解决三个问题：

1. 项目布局（apps/libs 在哪里）
2. 默认 target 行为（依赖顺序、缓存策略）
3. 缓存与 affected 的“输入集合”（namedInputs）

### 2.1 workspaceLayout：让 Nx 贴合你的目录约定

```json
{
  "workspaceLayout": { "appsDir": "apps", "libsDir": "packages" }
}
```

### 2.2 defaultBase：affected 对比基线

```json
{ "defaultBase": "main" }
```

影响命令：`nx affected -t build`、`nx affected -t lint` 等。

### 2.3 namedInputs：缓存正确性的核心

你要把 `namedInputs` 当成“缓存 key 的组成规则”。常见组合：

- `default`：项目自身文件 + 全局关键文件
- `production`：面向 build 的输入，排除测试与文档，让缓存稳定
- `sharedGlobals`：锁文件、tsconfig、lint 配置等，一变就应该让缓存失效

示例（概念）：

```json
{
  "namedInputs": {
    "default": ["{projectRoot}/**/*", "sharedGlobals"],
    "production": ["default", "!{projectRoot}/**/*.spec.*", "!{projectRoot}/**/*.test.*", "!{projectRoot}/**/*.md"],
    "sharedGlobals": [
      "{workspaceRoot}/package.json",
      "{workspaceRoot}/pnpm-lock.yaml",
      "{workspaceRoot}/pnpm-workspace.yaml",
      "{workspaceRoot}/tsconfig.base.json",
      "{workspaceRoot}/biome.json"
    ]
  }
}
```

常见踩坑：

- 没把 `pnpm-lock.yaml` 放进 inputs：依赖变化但缓存误命中
- 没把 `tsconfig.base.json` 放进 inputs：类型规则变化但缓存误命中

### 2.4 targetDefaults：默认编排与缓存策略

建议策略（概念）：

```json
{
  "targetDefaults": {
    "build": { "dependsOn": ["^build"], "inputs": ["production"], "cache": true },
    "lint": { "inputs": ["default"], "cache": true },
    "typecheck": { "inputs": ["default"], "cache": true },
    "test": { "inputs": ["default"], "cache": true },
    "dev": { "cache": false }
  }
}
```

理解 `^build`：

- 表示“先跑依赖项目的 build”
- 例：`admin` 依赖 `shared`，则 `nx build admin` 会先 `nx build shared`

## 3. 项目配置：project.json（项目的自我描述）

每个项目一个 `project.json`，建议放在项目目录根：

- `apps/app/project.json`
- `apps/admin/project.json`
- `apps/api/project.json`
- `apps/admin-api/project.json`
- `apps/app-rn/project.json`
- `packages/shared/project.json`
- `packages/utils/project.json`

### 3.1 关键字段解释

- `name`：项目唯一名（建议与目录名一致）
- `projectType`：`application` 或 `library`
- `sourceRoot`：源码根目录
- `tags`：用于边界治理（强烈建议配置）
- `targets`：这个项目能跑什么

### 3.2 tags：为边界治理做准备

建议先定一套可扩展的 tags 体系：

- apps
  - `type:app`
  - `runtime:web|api|rn`
  - `scope:toc|tob`（可选，用于 ToC/ToB 聚合）
- libs
  - `type:lib`
  - `scope:shared|utils`
  - `layer:contracts|domain|infra|adapter`（未来若把 shared 分层拆成多个 Nx project，则用这个）

即使早期不做边界规则，tags 也值得先贴上，后续治理会省很多成本。

## 4. targets 设计：如何把命令变成“可缓存任务”

一个 target 要想可缓存，需满足：

- 输入可描述（inputs）
- 输出可描述（outputs）
- 执行是确定性的（同输入同输出）

### 4.1 为什么 dev 通常不缓存

`dev` 是长时间运行的进程，输出不是“确定产物”，缓存意义不大。策略 B 下：

- Web 的热更新由 Vite 负责
- RN 的热更新由 Metro/Expo 负责
- API 的重启由 nodemon 负责

Nx 只需要提供统一入口与并行启动能力。

### 4.2 build 的 outputs 必须写对

典型输出：

- Vite：`{projectRoot}/dist`
- Nest：`{projectRoot}/dist`
- libs：`{projectRoot}/dist`（即便 dev 不依赖 dist，CI/发布仍依赖）

不写 outputs 的后果：

- 缓存命中但无法复用产物
- CI/本地的加速收益大幅下降

## 5. “你仓库专属”的 project.json 模板（可照抄改名）

下面模板强调“渐进引入”：先用 `command` 调用各项目已有的 pnpm scripts。

### 5.1 apps/app（Vite）

```json
{
  "name": "app",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "apps/app/src",
  "projectType": "application",
  "tags": ["type:app", "runtime:web", "scope:toc"],
  "targets": {
    "dev": { "command": "pnpm -C apps/app dev" },
    "build": { "command": "pnpm -C apps/app build", "outputs": ["{projectRoot}/dist"] },
    "lint": { "command": "pnpm -C apps/app lint" },
    "typecheck": { "command": "pnpm -C apps/app typecheck" }
  }
}
```

### 5.2 apps/admin（Vite）

```json
{
  "name": "admin",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "apps/admin/src",
  "projectType": "application",
  "tags": ["type:app", "runtime:web", "scope:tob"],
  "targets": {
    "dev": { "command": "pnpm -C apps/admin dev" },
    "build": { "command": "pnpm -C apps/admin build", "outputs": ["{projectRoot}/dist"] },
    "lint": { "command": "pnpm -C apps/admin lint" },
    "typecheck": { "command": "pnpm -C apps/admin typecheck" }
  }
}
```

### 5.3 apps/api（Nest）

```json
{
  "name": "api",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "apps/api/src",
  "projectType": "application",
  "tags": ["type:app", "runtime:api", "scope:toc"],
  "targets": {
    "dev": { "command": "pnpm -C apps/api dev" },
    "build": { "command": "pnpm -C apps/api build", "outputs": ["{projectRoot}/dist"] },
    "lint": { "command": "pnpm -C apps/api lint" },
    "typecheck": { "command": "pnpm -C apps/api typecheck" }
  }
}
```

### 5.4 apps/admin-api（Nest）

```json
{
  "name": "admin-api",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "apps/admin-api/src",
  "projectType": "application",
  "tags": ["type:app", "runtime:api", "scope:tob"],
  "targets": {
    "dev": { "command": "pnpm -C apps/admin-api dev" },
    "build": { "command": "pnpm -C apps/admin-api build", "outputs": ["{projectRoot}/dist"] },
    "lint": { "command": "pnpm -C apps/admin-api lint" },
    "typecheck": { "command": "pnpm -C apps/admin-api typecheck" }
  }
}
```

### 5.5 apps/app-rn（Expo/Metro）

```json
{
  "name": "app-rn",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "apps/app-rn/src",
  "projectType": "application",
  "tags": ["type:app", "runtime:rn", "scope:toc"],
  "targets": {
    "dev": { "command": "pnpm -C apps/app-rn dev" },
    "lint": { "command": "pnpm -C apps/app-rn lint" },
    "typecheck": { "command": "pnpm -C apps/app-rn typecheck" }
  }
}
```

### 5.6 packages/shared（lib）

```json
{
  "name": "shared",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "packages/shared/src",
  "projectType": "library",
  "tags": ["type:lib", "scope:shared"],
  "targets": {
    "build": { "command": "pnpm -C packages/shared build", "outputs": ["{projectRoot}/dist"] },
    "lint": { "command": "pnpm -C packages/shared lint" },
    "typecheck": { "command": "pnpm -C packages/shared typecheck" }
  }
}
```

### 5.7 packages/utils（lib）

```json
{
  "name": "utils",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "packages/utils/src",
  "projectType": "library",
  "tags": ["type:lib", "scope:utils"],
  "targets": {
    "build": { "command": "pnpm -C packages/utils build", "outputs": ["{projectRoot}/dist"] },
    "lint": { "command": "pnpm -C packages/utils lint" },
    "typecheck": { "command": "pnpm -C packages/utils typecheck" }
  }
}
```

注意：这里的 `typecheck/lint/build` 脚本名称需与你各项目 `package.json` 的 scripts 对齐；模板只表达 Nx 的组织方式。

## 6. 聚合场景（ToC/ToB 一键启动）

不必创建“虚拟项目”，直接用 run-many 即可：

- ToC：`nx run-many -t dev -p app api --parallel`
- ToB：`nx run-many -t dev -p admin admin-api --parallel`
- 全部：`nx run-many -t dev --all --parallel`

如果你希望固化为短命令，可在根 `package.json` scripts 里提供别名，但本质仍是 Nx target。

## 7. 边界治理（建议在 Nx 稳定后再做）

引入 Nx 的最终形态通常会加“依赖边界规则”，与 shared 分层一致：

- Web/RN 只能依赖 `shared/contracts` 与 `utils`
- API 才能依赖 `shared/infra` 与 `shared/adapter`

落地方式常见是“tags + lint 规则”的组合，先贴 tags，再逐步加规则、逐步收紧。

## 8. 验收标准（你可以用它判断 Nx 是否引入成功）

- `nx run-many -t dev --all --parallel` 可以一键启动多个项目
- `nx affected -t build` 改 shared 后只构建受影响项目
- `nx build <project>` 会自动先 build 依赖项目（`^build` 生效）
- build/lint/typecheck 在本地与 CI 有明显缓存收益，且不会误命中
