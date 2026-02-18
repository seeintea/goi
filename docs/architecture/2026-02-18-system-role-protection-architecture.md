# 系统角色保护与规则架构方案 (2026-02-18)

## 背景

为了确保 C 端（家庭/APP）业务逻辑的稳定性，需要防止 B 端（Admin）意外删除或修改关键的系统内置角色（如 `OWNER`, `GUEST`）。
经过讨论，我们决定采用一套 **声明式保护策略 (Declarative Protection Policy)**，并通过分层架构来实现前后端的一致性控制。

## 核心架构设计

### 1. 新增包 `packages/rules` (共享规则层)

- **定位**：存放跨端共享的业务规则配置，作为“单一事实来源 (Single Source of Truth)”。
- **命名**：选择简洁的 `rules`，避免 `constants`（太技术）或 `domain-config`（太长）。
- **管理**：使用 `rslib` 进行构建（支持 ESM/CJS），并通过 `nx` 进行 monorepo 管理。
- **内容示例**：
  ```typescript
  // src/role/protection.ts
  export const SHARED_ROLE_PROTECTION = {
    identifiers: ["OWNER", "GUEST"], // 受保护的角色 Code
    actions: {
      delete: false, // 禁止删除
      updateStatus: false, // 禁止修改禁用状态
    },
  } as const
  ```

### 2. 基础设施 `packages/nest-kit` (引擎层)

- **模块**: `SystemProtectionModule` / `SystemProtectionService` (原 `SystemGuard`)
- **位置**: `src/modules/system-protection`
- **定位**：通用的规则校验引擎，无业务状态，仅负责执行逻辑。
- **核心特性**:
  - **大小写不敏感**: `validate` 和 `can` 方法内部执行 `toUpperCase()` 对比，增强容错性。
- **核心方法**:
  - `validate(resource, action, identifier)`: 校验操作是否合法，非法则抛异常。
  - `can(resource, action, identifier)`: 返回 boolean，用于前端视图判断。

### 3. 应用接入 `apps/admin-api` (业务层)

#### A. 配置注入

- 引入 `SHARED_ROLE_PROTECTION`。
- 可扩展 Admin 独有的规则（如 `SUPER_ADMIN` 保护）。

#### B. DTO 扩展 (视图模型)

- **不修改 Contracts**：保持 `packages/contracts` 的纯净性。
- **Admin DTO**：在 `RoleResponseDto` 中扩展 `allowDelete` 和 `allowDisable` 字段。
  ```typescript
  export class RoleResponseDto extends createZodDto(appRoleResponseSchema) {
    allowDelete: boolean
    allowDisable: boolean
  }
  ```

#### C. Service 层逻辑

- **写操作 (Delete/Update)**：调用 `SystemProtection.validate()` 进行拦截。
- **读操作 (List/Find)**：调用 `SystemProtection.can()` 动态计算并填充 DTO 的 `allow*` 字段。

### 4. 前端适配 `apps/admin` (交互层)

- **类型定义**：更新 `AppRole` 类型，增加 `allowDelete/allowDisable`。
- **UI 交互**：
  - **删除按钮**：若 `allowDelete=false`，禁用按钮并显示 Tooltip "系统角色禁止删除"。
  - **状态开关**：若 `allowDisable=false`，禁用 Switch 组件。

## 实施路线

1.  创建 `packages/rules` 包，配置 `rslib` 和 `nx`。
2.  在 `nest-kit` 中实现 `SystemProtection` 模块。
3.  在 `admin-api` 中接入规则，并更新 DTO 和 Service。
4.  在 `admin` 前端适配 UI。
