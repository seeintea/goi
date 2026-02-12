# 数据库 Schema 标准化提案

## 1. 背景 (Context)

当前代码库在实现层（Drizzle ORM 实体）与设计文档（`database-schema.md` / `init.sql`）之间存在命名规范不一致的问题。本文档概述了后续将采用的标准规范，以确保整个平台的一致性。

## 2. 命名规范 (Naming Conventions)

### 2.1 表名 (Tables)

- **格式**: Snake Case (`snake_case`)
- **前缀**:
  - `auth_`: 认证与授权 (例如：`auth_user`, `auth_role`)
  - `fin_`: 财务业务领域 (例如：`fin_families`, `fin_transactions`)
  - `sys_`: 系统基础设施 (例如：`sys_audit_log`, `sys_settings`)
  - `admin_`: 管理端特定配置 (如有)

### 2.2 字段名 (Columns)

- **格式**: Snake Case (`snake_case`)
- **时间戳**:
  - 创建时间: `created_at` (标准) vs `create_time` (旧版)
  - 更新时间: `updated_at` (标准) vs `update_time` (旧版)
- **主键**:
  - `id` (UUID): 用于业务实体（家庭、交易流水等）
  - `user_id`, `role_id` 等: 用于认证实体（与现有 auth schema 保持一致）

## 3. 差异分析 (Gap Analysis)

| 概念                         | 当前代码 (`packages/infra`)                                 | 目标标准 (`init.sql`)                                    | 所需操作                                 |
| ---------------------------- | ----------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------- |
| **家庭/账本 (Family/Book)**  | 表名: `finance_book`<br>PK: `book_id`<br>模型: `BookEntity` | 表名: `fin_families`<br>PK: `id`<br>模型: `FamilyEntity` | 重命名表和实体。更新业务逻辑。           |
| **家庭成员 (Family Member)** | 表名: `finance_book_member`                                 | 表名: `fin_family_members`                               | 重命名表和实体。                         |
| **时间戳 (Timestamps)**      | `create_time`<br>`update_time`                              | `created_at`<br>`updated_at`                             | 在 Drizzle schema 中进行全局搜索和替换。 |
| **用户 (User)**              | `auth_user` (匹配)<br>`create_time`                         | `auth_user`<br>`created_at`                              | 仅更新时间戳字段。                       |

## 4. 迁移计划 (Migration Plan)

1. **第一阶段：标准化 (文档)** - _已完成_
   - 更新 `init.sql` 和 `database-schema.md` 以反映目标标准。
2. **第二阶段：代码重构** - _待批准_
   - 重命名 Drizzle 实体以匹配新的表名。
   - 更新 Drizzle schema 中的列定义。
   - 生成 Drizzle 迁移文件。
   - 更新引用旧字段名的应用逻辑。
