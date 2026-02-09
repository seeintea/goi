# Workspace 内部包：通配符 exports + 开发期源码导入方案

本文记录一套用于 monorepo/workspace 的包导出与导入约定，目标是：

- 子路径导入（`@scope/pkg/app/user` 这类）不需要每新增一个模块就修改 `package.json exports`。
- 开发期（ts-node）直接导入源码（`packages/*/src`），便于调试与热更新。
- 产物期（node dist）仍通过 `package.json exports` 稳定解析到 `dist`。

## 适用前提

- 包以 workspace 方式在仓库内使用（不强调对外发布），但仍希望 `prod` 能跑 `dist`。
- 后端开发期使用 `ts-node -r tsconfig-paths/register`（或等价能力）加载 TS 源码。

## 目标导入形态（建议）

将公开出口收敛到两层：

- 语义边界：`app/` 与 `admin/`
- 模块边界：`{feature}`（例如 `user`/`role`/`book`）

导入示例：

```ts
import { CreateUserDto } from "@goi/contracts/app/user"
import { AdminUserListQueryDto } from "@goi/contracts/admin/user"

import { APP_USER_REPOSITORY } from "@goi/persistence/tokens/app"
import { ADMIN_USER_REPOSITORY } from "@goi/persistence/tokens/admin"
import { DrizzleAppUserRepository } from "@goi/persistence/app/user"
```

## 目录与构建产物约定

exports 使用通配符依赖“构建产物结构与源码结构对齐”。以下为推荐结构（示意）：

```text
packages/contracts/
  src/
    app/user/index.ts
    admin/user/index.ts
  dist/
    app/user/index.js
    app/user/index.d.ts
    admin/user/index.js
    admin/user/index.d.ts

packages/persistence/
  src/
    app/user/index.ts
    admin/user/index.ts
    tokens/app/index.ts
    tokens/admin/index.ts
  dist/
    app/user/index.js
    app/user/index.d.ts
    admin/user/index.js
    admin/user/index.d.ts
    tokens/app/index.js
    tokens/app/index.d.ts
    tokens/admin/index.js
    tokens/admin/index.d.ts
```

## 通配符 exports（subpath pattern）

### @goi/contracts 的 package.json 示例

```json
{
  "name": "@goi/contracts",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.js"
    },
    "./app/*": {
      "types": "./dist/app/*/index.d.ts",
      "import": "./dist/app/*/index.js",
      "require": "./dist/app/*/index.js"
    },
    "./admin/*": {
      "types": "./dist/admin/*/index.d.ts",
      "import": "./dist/admin/*/index.js",
      "require": "./dist/admin/*/index.js"
    }
  },
  "files": ["dist"]
}
```

### @goi/persistence 的 package.json 示例

```json
{
  "name": "@goi/persistence",
  "private": true,
  "type": "module",
  "exports": {
    "./app/*": {
      "types": "./dist/app/*/index.d.ts",
      "import": "./dist/app/*/index.js",
      "require": "./dist/app/*/index.js"
    },
    "./admin/*": {
      "types": "./dist/admin/*/index.d.ts",
      "import": "./dist/admin/*/index.js",
      "require": "./dist/admin/*/index.js"
    },
    "./tokens/app": {
      "types": "./dist/tokens/app/index.d.ts",
      "import": "./dist/tokens/app/index.js",
      "require": "./dist/tokens/app/index.js"
    },
    "./tokens/admin": {
      "types": "./dist/tokens/admin/index.d.ts",
      "import": "./dist/tokens/admin/index.js",
      "require": "./dist/tokens/admin/index.js"
    }
  },
  "files": ["dist"]
}
```

## 开发期源码导入（tsconfig paths）

开发期目标：让 `@goi/contracts/*`、`@goi/persistence/*` 在 ts-node 执行时直接映射到 `packages/*/src/*`，便于调试。

以 `apps/app-api` 为例（示意）：

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@goi/contracts/*": ["../../packages/contracts/src/*"],
      "@goi/persistence/*": ["../../packages/persistence/src/*"]
    }
  }
}
```

配套执行方式（示意）：

```text
ts-node -r tsconfig-paths/register src/main.ts
```

说明：

- 开发期通过 `tsconfig-paths/register` 生效。
- 产物期（`node dist/main.js`）不会加载 `tsconfig-paths/register`，因此会回到 Node 标准解析，使用 `package.json exports -> dist`。

## 关键约束与注意事项

- 通配符 `./app/*` 的 `*` 只匹配“一段路径”（例如 `user`），因此建议把公开入口固定为 `app/{feature}`，不要把入口设计成 `app/user/dto` 这种更深层级。
- exports 公开层级越浅越好：推荐 `app/admin + feature`；避免只提供 `@goi/contracts/app` 大入口导致 barrel 过大与命名冲突。
- `contracts` 不依赖 `persistence` 与 `nest-kit`；`persistence` 与 `nest-kit` 可依赖 `contracts`。依赖方向需要单向，避免包间循环依赖。

## 拆包与重命名

如果要从 `@goi/shared` 演进到 `contracts / persistence / nest-kit` 三包结构，可参考：

- `docs/finances/package-split-and-rename.md`
