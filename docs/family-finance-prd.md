# 家庭财务管理系统（Family Finance）PRD v1.3


> **版本**：v1.3
> **状态**：详细设计中
> **更新日期**：2026-02-04
> **目标**：打造一款支持多成员协作、隐私安全、数据可视化的现代家庭财务管理系统。

---

## 1. 背景与目标

### 1.1 背景

随着家庭资产配置的多元化（工资、理财、房产、借贷等）和消费场景的复杂化，传统的 Excel 记账或单机版记账软件已无法满足以下需求：

- **多人协作**：夫妻共同管理家庭账户，同时保留个人隐私账户。
- **数据整合**：分散在微信、支付宝、银行卡的资金流向难以统一视图。
- **资产全景**：缺乏对净资产（资产 - 负债）的实时监控。
- **数据主权**：用户希望完全掌控自己的财务数据，避免隐私泄露。

### 1.2 产品目标

1. **全景视图**：提供家庭视角的资产负债表和收支损益表。
2. **高效协作**：支持多用户基于角色的权限管理（RBAC），实现“共同账本”与“私有账本”的隔离。
3. **极致体验**：移动端优先的快速记账体验，支持离线记账（Offline-first），PC 端强大的报表分析能力。
4. **技术先进**：采用前后端分离架构，确保系统的可扩展性与高性能。

### 1.3 非目标（本阶段）

- 复杂的股票/期货实盘交易追踪（仅记录市值变化）。
- 银行接口直连（Open Banking 门槛高，暂通过账单导入解决）。

---

## 2. 用户与角色

| 角色                 | 标识       | 权限描述                                              | 典型场景                         |
| :------------------- | :--------- | :---------------------------------------------------- | :------------------------------- |
| **家庭拥有者** | `OWNER`  | 最高权限，管理家庭生命周期、支付订阅、数据备份/销毁。 | 创建家庭，邀请配偶加入。         |
| **管理员**     | `ADMIN`  | 管理公共配置（分类、标签、公共账户），管理普通成员。  | 设置家庭预算，整理公共分类树。   |
| **成员**       | `MEMBER` | 记录交易，查看授权范围内的账本和报表。                | 日常记账，查看自己和公共的消费。 |
| **访客**       | `GUEST`  | 仅只读权限，查看特定报表。                            | 给父母或理财顾问查看财务概况。   |

---

## 3. 功能模块详解

### 3.1 核心业务模块

1. **多账本体系**
   - 支持“默认家庭账本”、“个人私房钱账本”、“装修专项账本”。
   - 每个账本独立配置币种、成员权限。
2. **账户管理 (Asset & Liability)**
   - **资产账户**：现金、储蓄卡、支付宝/微信余额、投资账户（股票/基金市值）。
   - **负债账户**：信用卡、房贷、车贷、借条。
   - **功能**：余额校准（平账）、账户归档、卡号备注。
3. **交易流水 (Transaction)**
   - **支出 (Expense)**：餐饮、交通、购物等。
   - **收入 (Income)**：工资、奖金、投资收益。
   - **转账 (Transfer)**：账户间资金划转（不计入收支，但可计入手续费）。
   - **余额调整 (Adjustment)**：盘点资金时的修正。
   - **元数据**：多标签、图片附件、地理位置、关联人员（谁花的/花在谁身上）。
4. **自动化与周期性交易 (Automation)**
   - **周期性规则**：定义“每月1日自动生成房租支出”或“每月15日提醒记录工资”。
   - **规则参数**：频率（日/周/月/年）、结束条件（次数/日期）、自动确认或仅提醒。
5. **预算管理 (Budget)**
   - **多维预算**：支持按月/按年、按分类（如餐饮）、按标签（如“旅游”）、按成员（如“老公零花钱”）设置预算。
   - **滚动预算**：上月结余可自动转入下月预算（可选）。
   - **预警**：进度条显示，超支提醒（App 推送/邮件）。
6. **债务与信用 (Debt & Credit)**
   - **借入/借出**：独立管理借条，关联对方姓名，记录还款进度。
   - **分期管理**：针对大额消费（如装修、购买数码产品）设置分期计划，自动生成每月待还款项。
7. **多币种支持 (Multi-Currency)**
   - **汇率管理**：记录交易时的汇率，支持手动指定或自动拉取当日汇率（需外部API）。
   - **本位币统计**：所有报表自动折算为家庭默认币种展示。

### 3.2 报表与分析

- **概览 (Dashboard)**：当月收支、净资产趋势、预算执行率。
- **收支分析**：分类饼图、趋势折线图、成员贡献对比。
- **资产负债表**：特定时间点的资产分布与负债结构。
- **现金流分析**：展示资金流入流出的时序图，辅助预测资金缺口。

### 3.3 系统管理

- **分类管理**：多级树形分类，支持图标与颜色自定义。
- **数据导入**：支持支付宝、微信、银行账单 Excel/CSV 解析与映射。
- **数据导出**：全量数据导出为 JSON/CSV。
- **回收站**：误删数据保留 30 天可恢复。

---

## 4. 技术架构方案

### 4.1 总体架构

采用 **前后端分离 (SPA + API)** 架构，容器化部署。

### 4.2 前端技术栈 (Web/PWA)

- **框架**：React 18
- **构建工具**：Vite
- **语言**：TypeScript
- **UI 组件库**：Ant Design 5.x (PC端) / Ant Design Mobile (移动端适配)
- **状态管理**：Zustand (轻量级) + React Query (服务端状态同步)
- **本地存储**：IndexedDB (LocalForage) - 用于离线缓存和草稿箱。
- **PWA**：Service Worker 实现离线访问，Manifest 实现安装到桌面。
- **路由**：React Router v6
- **图表**：ECharts 或 Ant Design Charts
- **表单**：React Hook Form

### 4.3 后端技术栈 (Server)

- **框架**：NestJS (Node.js 框架，模块化，易维护)
- **语言**：TypeScript
- **ORM**：Prisma (类型安全，Schema 定义清晰，自动生成迁移脚本)
- **数据库**：PostgreSQL 15+ (稳定，支持 JSONB，适合复杂查询)
- **缓存/队列**：Redis (可选，用于限流、异步任务如导入解析)
- **认证**：Passport.js + JWT (Access Token + Refresh Token)
- **验证**：class-validator + class-transformer
- **文档**：Swagger (OpenAPI 3.0)

### 4.4 部署架构

- **Docker Compose**：编排前端 (Nginx)、后端 (Node.js)、数据库 (PostgreSQL)、Redis。
- **CI/CD**：GitHub Actions 自动构建镜像并推送到 Registry。

---

## 5. 数据库设计 (Database Schema)

基于 PostgreSQL 设计，采用 Snake Case (`snake_case`) 命名规范。

### 5.1 核心表设计

#### 1. 用户表 (`users`)

全局用户中心。

| 字段名               | 类型      | 约束             | 说明         |
| :------------------- | :-------- | :--------------- | :----------- |
| `id`               | UUID      | PK               | 用户唯一标识 |
| `email`            | VARCHAR   | UNIQUE, NOT NULL | 登录邮箱     |
| `password_hash`    | VARCHAR   | NOT NULL         | 加密密码     |
| `nickname`         | VARCHAR   |                  | 用户昵称     |
| `default_currency` | VARCHAR   | DEFAULT 'CNY'    | 个人偏好币种 |
| `created_at`       | TIMESTAMP | DEFAULT NOW()    |              |
| `updated_at`       | TIMESTAMP |                  |              |
| `deleted_at`       | TIMESTAMP |                  | 软删除       |

#### 2. 家庭表 (`families`)

租户隔离的核心单元。

| 字段名            | 类型      | 约束           | 说明       |
| :---------------- | :-------- | :------------- | :--------- |
| `id`            | UUID      | PK             | 家庭ID     |
| `name`          | VARCHAR   | NOT NULL       | 家庭名称   |
| `owner_id`      | UUID      | FK -> users.id | 创建者     |
| `base_currency` | VARCHAR   | DEFAULT 'CNY'  | 家庭本位币 |
| `created_at`    | TIMESTAMP | DEFAULT NOW()  |            |

#### 3. 家庭成员表 (`family_members`)

| 字段名        | 类型    | 约束                                   | 说明 |
| :------------ | :------ | :------------------------------------- | :--- |
| `id`        | UUID    | PK                                     |      |
| `family_id` | UUID    | FK -> families.id                      |      |
| `user_id`   | UUID    | FK -> users.id                         |      |
| `role`      | VARCHAR | ENUM('OWNER','ADMIN','MEMBER','GUEST') | 角色 |
| `status`    | VARCHAR | ENUM('INVITED', 'ACTIVE', 'DISABLED')  | 状态 |

#### 4. 账户表 (`accounts`)

| 字段名                 | 类型    | 约束              | 说明                                 |
| :--------------------- | :------ | :---------------- | :----------------------------------- |
| `id`                 | UUID    | PK                |                                      |
| `family_id`          | UUID    | FK -> families.id |                                      |
| `name`               | VARCHAR | NOT NULL          | 账户名称                             |
| `type`               | VARCHAR | NOT NULL          | CASH, BANK, CREDIT, INVESTMENT, LOAN |
| `balance`            | DECIMAL | DEFAULT 0         | 当前余额                             |
| `currency_code`      | VARCHAR | DEFAULT 'CNY'     | 币种                                 |
| `credit_limit`       | DECIMAL |                   | 信用额度 (信用卡用)                  |
| `billing_day`        | INT     |                   | 账单日                               |
| `due_day`            | INT     |                   | 还款日                               |
| `icon`               | VARCHAR |                   | 图标                                 |
| `color`              | VARCHAR |                   | 颜色                                 |
| `exclude_from_stats` | BOOLEAN | DEFAULT FALSE     | 不计入统计                           |
| `archived`           | BOOLEAN | DEFAULT FALSE     | 归档/停用                            |

#### 5. 分类表 (`categories`)

| 字段名        | 类型    | 约束                      | 说明          |
| :------------ | :------ | :------------------------ | :------------ |
| `id`        | UUID    | PK                        |               |
| `family_id` | UUID    | FK -> families.id         |               |
| `name`      | VARCHAR | NOT NULL                  | 分类名称      |
| `type`      | VARCHAR | ENUM('EXPENSE', 'INCOME') |               |
| `parent_id` | UUID    | FK -> categories.id       |               |
| `is_hidden` | BOOLEAN | DEFAULT FALSE             | 是否隐藏/归档 |
| `icon`      | VARCHAR |                           | 图标          |

#### 6. 交易流水表 (`transactions`)

| 字段名                    | 类型      | 约束                                  | 说明                          |
| :------------------------ | :-------- | :------------------------------------ | :---------------------------- |
| `id`                    | UUID      | PK                                    |                               |
| `family_id`             | UUID      | FK -> families.id                     |                               |
| `type`                  | VARCHAR   | ENUM('EXPENSE', 'INCOME', 'TRANSFER') |                               |
| `amount`                | DECIMAL   | NOT NULL                              | 交易原币种金额                |
| `currency_code`         | VARCHAR   | DEFAULT 'CNY'                         | 交易币种                      |
| `exchange_rate`         | DECIMAL   | DEFAULT 1.0                           | 对家庭本位币汇率              |
| `account_id`            | UUID      | FK -> accounts.id                     | 源账户                        |
| `target_account_id`     | UUID      | FK -> accounts.id                     | 目标账户 (转账用)             |
| `fee`                   | DECIMAL   | DEFAULT 0                             | 手续费 (仅转账用)             |
| `fee_account_id`        | UUID      | FK -> accounts.id                     | 手续费扣除账户 (通常同源账户) |
| `category_id`           | UUID      | FK -> categories.id                   |                               |
| `tag_ids`               | UUID[]    |                                       | 标签ID数组                    |
| `description`           | TEXT      |                                       |                               |
| `occurred_at`           | TIMESTAMP | NOT NULL                              | 交易时间                      |
| `created_by`            | UUID      | FK -> users.id                        |                               |
| `created_at`            | TIMESTAMP | DEFAULT NOW()                         |                               |
| `updated_at`            | TIMESTAMP |                                       |                               |
| `deleted_at`            | TIMESTAMP |                                       | 软删除 (回收站)               |
| `parent_transaction_id` | UUID      | FK -> transactions.id                 | 关联父交易 (如分拆、退款)     |
| `location`              | JSONB     |                                       | 地理位置 {lat, lng, name}     |
| `attachments`           | TEXT[]    |                                       | 附件URL列表                   |

#### 7. 周期性交易规则表 (`recurring_transactions`)

| 字段名                | 类型    | 约束                                         | 说明                             |
| :-------------------- | :------ | :------------------------------------------- | :------------------------------- |
| `id`                | UUID    | PK                                           |                                  |
| `family_id`         | UUID    | FK -> families.id                            |                                  |
| `template_snapshot` | JSONB   | NOT NULL                                     | 交易模板 (金额, 分类, 账户等)    |
| `frequency_type`    | VARCHAR | ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY') | 频率                             |
| `interval`          | INT     | DEFAULT 1                                    | 间隔 (如每2个月)                 |
| `start_date`        | DATE    | NOT NULL                                     | 开始日期                         |
| `end_date`          | DATE    |                                              | 结束日期 (可选)                  |
| `next_run_date`     | DATE    | NOT NULL                                     | 下次执行日期                     |
| `auto_create`       | BOOLEAN | DEFAULT FALSE                                | 是否自动生成交易 (False则仅提醒) |

#### 8. 预算表 (`budgets`)

| 字段名              | 类型    | 约束                                | 说明           |
| :------------------ | :------ | :---------------------------------- | :------------- |
| `id`              | UUID    | PK                                  |                |
| `family_id`       | UUID    | FK -> families.id                   |                |
| `name`            | VARCHAR |                                     | 预算名称       |
| `amount`          | DECIMAL | NOT NULL                            | 预算金额       |
| `period_type`     | VARCHAR | ENUM('MONTHLY', 'YEARLY', 'CUSTOM') | 周期类型       |
| `start_date`      | DATE    |                                     | 开始日期       |
| `end_date`        | DATE    |                                     | 结束日期       |
| `category_ids`    | UUID[]  |                                     | 关联分类ID列表 |
| `tag_ids`         | UUID[]  |                                     | 关联标签ID列表 |
| `alert_threshold` | DECIMAL | DEFAULT 0.8                         | 预警阈值       |

#### 9. 汇率表 (`exchange_rates`)

| 字段名            | 类型    | 约束           | 说明     |
| :---------------- | :------ | :------------- | :------- |
| `date`          | DATE    | PK (Composite) | 汇率日期 |
| `from_currency` | VARCHAR | PK (Composite) | 源币种   |
| `to_currency`   | VARCHAR | PK (Composite) | 目标币种 |
| `rate`          | DECIMAL | NOT NULL       | 汇率值   |

#### 10. 分期计划表 (`installments`) **[新增]**

| 字段名            | 类型    | 约束                       | 说明                          |
| :---------------- | :------ | :------------------------- | :---------------------------- |
| `id`            | UUID    | PK                         |                               |
| `family_id`     | UUID    | FK -> families.id          |                               |
| `description`   | VARCHAR | NOT NULL                   | 分期描述 (如: iPhone 15 分期) |
| `total_amount`  | DECIMAL | NOT NULL                   | 总金额                        |
| `currency_code` | VARCHAR | DEFAULT 'CNY'              | 币种                          |
| `total_periods` | INT     | NOT NULL                   | 总期数                        |
| `start_date`    | DATE    | NOT NULL                   | 首期日期                      |
| `account_id`    | UUID    | FK -> accounts.id          | 扣款账户 (通常是信用卡)       |
| `category_id`   | UUID    | FK -> categories.id        | 分类                          |
| `status`        | VARCHAR | ENUM('ACTIVE', 'FINISHED') | 状态                          |

#### 11. 账户余额快照表 (`account_balance_snapshots`) **[新增]**

用于快速生成净资产报表。

| 字段名            | 类型    | 约束              | 说明     |
| :---------------- | :------ | :---------------- | :------- |
| `id`            | UUID    | PK                |          |
| `account_id`    | UUID    | FK -> accounts.id |          |
| `date`          | DATE    | NOT NULL          | 快照日期 |
| `balance`       | DECIMAL | NOT NULL          | 当日余额 |
| `currency_code` | VARCHAR |                   | 当日币种 |

---

## 6. API 接口设计概览

### 6.1 认证 (Auth)

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`

### 6.2 账户 (Accounts)

- `GET /families/:id/accounts`
- `POST /families/:id/accounts`

### 6.3 交易 (Transactions)

- `GET /families/:id/transactions`
  - Query: `startDate`, `endDate`, `type`, `categoryId`, `accountId`, `keyword`
- `POST /families/:id/transactions`
- `POST /families/:id/transactions/batch` (批量导入用)

### 6.4 周期性规则 (Recurring)

- `GET /families/:id/recurring`
- `POST /families/:id/recurring`
- `POST /families/:id/recurring/:ruleId/execute` (手动触发生成)

### 6.5 预算 (Budgets)

- `GET /families/:id/budgets`
- `GET /families/:id/budgets/status` (获取预算执行进度)

### 6.6 报表 (Reports)

- `GET /families/:id/reports/cashflow` (现金流)
- `GET /families/:id/reports/category-pie` (分类占比)
- `GET /families/:id/reports/net-worth` (净资产趋势)

---

## 7. 下一步计划

1. **环境准备**：初始化 NestJS 项目与 React 项目。
2. **后端开发**：定义 Prisma Schema，生成数据库迁移，实现 Auth 模块。
3. **前端开发**：搭建脚手架，实现登录页与主页布局。
4. **联调**：打通登录与基础记账流程。
