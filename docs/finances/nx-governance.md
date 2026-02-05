# Nx 治理与引入方案（在完成 workspace 改造后启用）

本文记录 Nx（Nx.js）在本仓库的引入动机、目标能力、建议的项目/target 设计，以及渐进落地路径。建议在完成 `apps/*` + `packages/*` 的 workspace 改造后再引入 Nx。

## 为什么需要 Nx（相对仅 pnpm-workspace）

pnpm-workspace 解决的是“工作区包发现与依赖安装”，但当项目数量增加后，仅依赖 `pnpm -r` / `--filter` 进行任务编排会逐渐繁琐，主要痛点包括：

- 任务编排：启动某个 app 之前需要先构建/监听其依赖库（共享层/工具包），否则运行失败
- 场景化开发：仅开发 admin/app/rn 时，希望一条命令完成“依赖准备 + dev 启动 + 变更联动”
- 受影响运行：改动共享库后，只运行受影响的项目，而不是全仓 build/test/lint
- 缓存：减少 CI 与本地的重复构建（本地/远程缓存）
- 依赖边界治理：阻止前端误引用后端专用层（例如 shared 的 infra/adapter）

Nx 的定位是“任务编排 + 依赖图 + 缓存 + 约束治理”，不会替代 pnpm-workspace。

## 目标（与本仓库开发场景对应）

核心开发场景：

1. 启动全部项目：自动按依赖顺序准备共享库，然后启动多个 app/api
2. 仅开发 admin：共享库改动可联动生效（策略 B：源码直引 + HMR/热更新）
3. 仅开发 app：同上
4. 仅开发 rn：共享库改动可联动生效（Metro/Expo watch workspace）

目标约束：

- 保持“依赖归属”在各子包：每个 workspace 包依旧声明自己的 dependencies
- 通过 Nx 统一运行入口：把日常命令从 `pnpm -r` / `--filter` 收敛为 `nx <target> <project>`
- 支持策略 B：开发时 app 直接引用 `packages/shared` 源码，不依赖“预先 build dist”

## 目录结构前置假设（方案 A）

完成 workspace 改造后，目录形态如下：

```text
apps/
  app/
  admin/
  api/
  admin-api/
  app-rn/

packages/
  shared/
  utils/
```

## 策略 B（源码直引）与 Nx 的协作模型

策略 B 的核心是：开发时 shared/utils 以源码形式被消费端（Vite/Metro/ts-node）直接编译与监听，从而实现“改共享库立即生效”。

- Web（Vite）：由 Vite 的 HMR 负责 shared 源码变更联动
- API（Nest + ts-node/nodemon）：由 nodemon/Nx watch 负责 shared 变更触发重启
- RN（Metro/Expo）：由 Metro watchFolders/resolver 负责 shared 源码变更联动

在策略 B 下，Nx 重点解决的是：

- 用依赖图把“项目之间的依赖关系”表达出来
- 用统一 targets/inputs/outputs 建立可缓存的 build/test/lint/typecheck
- 用 `affected` 只跑受影响项目

## Nx 中的项目分类（概念）

- apps：可运行应用（app/admin/api/admin-api/app-rn）
- libs：可复用库（shared/utils）

建议把 shared 的分层（contracts/domain/infra/adapter）作为“内部结构”，不强行拆成多个 Nx project（早期一个 shared project 即可）。

## 推荐的 targets（统一任务契约）

每个项目至少具备：

- dev：启动开发模式（Vite dev / Nest dev / Expo start）
- build：构建产物（用于发布/部署；libs 可输出 dist 与类型声明）
- lint：静态检查
- typecheck：类型检查
- test：测试（若引入）

依赖关系建议：

- `build`：默认依赖 `^build`（先构建依赖库）
- `dev`：在策略 B 下通常不依赖 `^build`；但 API 可选依赖 `^typecheck` 以提前暴露类型错误

## 场景命令设计（概念示例）

以下命令仅表达意图，具体 project 名称与脚本以改造后目录为准：

- 启动全部项目（开发）
  - `nx run-many -t dev --all --parallel`
- 仅开发 admin（含依赖）
  - `nx dev admin`
- 仅开发 app（含依赖）
  - `nx dev app`
- 仅开发 rn（含依赖）
  - `nx dev app-rn`

若需要同时启动“web + api”，可提供 workspace 级聚合 target（例如 `dev:toc`、`dev:tob`）：

- `dev:toc`：启动 app + api
- `dev:tob`：启动 admin + admin-api

## 缓存与受影响运行（Nx 的主要收益）

- 本地缓存：同一输入不会重复执行 build/test/lint/typecheck
- 远程缓存（可选）：CI 与开发机共享缓存，显著缩短流水线
- affected：只对改动影响到的项目运行目标（例如改 shared/contracts，只跑依赖它的 app/admin/rn）

## 依赖边界治理（与 shared 分层对齐）

建议 Nx 引入后逐步加上边界约束（例如 lint 规则/项目标签规则）：

- Web/RN 只能依赖 `shared/contracts` 与 `utils`
- API 才能依赖 `shared/infra` 与 `shared/adapter`

目的：把“架构约束”从口头约定升级为自动化检查，避免后期被误用拖垮策略 B。

## 渐进引入路径（推荐）

1. 完成 workspace 改造
   - 落地 `apps/*` + `packages/*`
   - 明确 shared 的分层与对外入口
2. 引入 Nx（最小可用）
   - 只做项目识别与 targets 映射（dev/build/lint/typecheck）
   - 先不强行改各包脚本，Nx 仅作为统一入口
3. 启用缓存与 affected
   - 在 CI 中把 build/test/lint/typecheck 切换为 Nx 执行
   - 逐步配置 inputs/outputs 以获得稳定缓存命中
4. 引入边界治理
   - 增加依赖边界规则，保证 shared/contracts 跨端安全
     5.（可选）远程缓存与更精细的 project 粒度
   - 团队规模或 CI 压力上升时再做
