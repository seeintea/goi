# 第二阶段迁移总结：系统与财务实体

**日期：** 2026-02-12
**状态：** 进行中（核心实体已定义，基础 CRUD 已实现）

## 1. 概览

本文档总结了应用架构从第一阶段（Auth 认证）向第二阶段（System 系统 & Finance 财务）迁移的变更内容。主要目标是确立财务和系统实体的数据库 Schema，并在 `apps/app-api` 中实现其基础的增删改查（CRUD）操作。

## 2. 数据库架构（基础设施层）

以下实体已在 `@goi/infra` 中确认并可用：

### 财务领域 (`fin_*`)

- **Family (`fin_families`)**：核心租户实体（替代了旧的 `financeBook`）。
- **FamilyMember (`fin_family_members`)**：家庭成员。
- **Account (`fin_accounts`)**：财务账户。
- **Budget (`fin_budgets`)**：预算规划。
- **Category (`fin_categories`)**：交易分类。
- **Tag (`fin_tags`)**：交易标签。
- **Transaction (`fin_transactions`)**：财务流水记录。
- **TransactionTag (`fin_transaction_tags`)**：交易与标签的多对多关联。

### 系统领域 (`sys_*`)

- **AuditLog (`sys_audit_log`)**：系统级审计日志。

_注意：已执行数据库迁移生成命令 (`drizzle-kit generate`)，确保 Schema 定义与迁移文件保持同步。_

## 3. 应用 API 变更 (`apps/app-api`)

### 新增模块

- **AuditLogModule**：实现了系统审计日志的只读访问。
  - 控制器：`GET /system/audit-logs`
  - 服务：支持按 `userId`、`targetEntity`、日期范围进行筛选。

### 更新模块（迁移至 `fin_*`）

- **AuthGuard**：
  - 移除了对 `financeBook` 的依赖。
  - 现在基于 `financeFamily` 和 `financeFamilyMember` 进行权限校验。
- **TransactionService**：
  - 修正字段映射：`transactionTime` -> `occurredAt`。
  - 增加了 Drizzle 查询中的日期类型转换逻辑。
- **FamilyMemberService**：
  - 修正字段映射：`createdAt` -> `joinedAt`。
- **BudgetService 及其他**：
  - 清理了未使用的导入和变量，修复了 Lint 错误。

### 配置与构建

- **tsconfig.json**：
  - 修复了路径映射，确保能通过相对路径正确解析 `@goi/*` 包。
  - 排除了 `utils-web` 以防止后端构建错误。
- **构建验证**：
  - `pnpm nx build app-api` 构建成功。

## 4. 验证步骤

验证变更的步骤如下：

1.  **构建项目**：
    ```bash
    pnpm nx build app-api
    ```
2.  **数据库迁移**（如果是新数据库环境）：
    ```bash
    pnpm -C packages/infra run db:push
    ```
3.  **API 测试**：
    - 确保 `POST /auth/login` 在新的 Guard 逻辑下正常工作。
    - 测试 `GET /system/audit-logs`（需要管理员/系统权限）。
    - 测试交易（Transaction）和家庭（Family）的 CRUD 接口。

## 5. 后续步骤

- 完成财务模块剩余的复杂业务逻辑。
- 实现前端对新 API 的集成。
- 为新服务添加单元测试/集成测试。
