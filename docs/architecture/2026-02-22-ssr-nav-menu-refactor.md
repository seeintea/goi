# SSR 导航菜单与权限改造方案

**日期**: 2026-02-22
**状态**: 规划中
**相关模块**: apps/app, apps/app-api, packages/contracts

## 1. 背景与目标

在从 SPA 迁移到 SSR (TanStack Start) 的过程中，前端维护路由树与菜单生成的逻辑变得复杂且难以与服务端权限校验完美同步。为了实现更安全、更轻量的架构，决定将“菜单生成逻辑”和“权限判断逻辑”解耦，采用**后端驱动的菜单 API**方案。

## 2. 核心原则

1.  **纯数据驱动 (Pure Data Driven)**: 数据库仅存储模块结构与权限标识，不存储 UI 状态（如图标组件、隐藏状态）。
2.  **后端主导 (Backend Authority)**: 菜单树的组装与过滤完全在后端完成，前端只负责渲染。
3.  **前端极简 (Frontend Minimalism)**: 前端不再维护路由树生成逻辑，`staticData` 仅用于路由守卫配置。

## 3. 改造方案

### 3.1 数据库与模型 (Database & Contract)

无需修改 `auth_module` 表结构，沿用现有字段：

- `moduleId`: 唯一标识
- `parentId`: 层级关系
- `name`: 模块名称 (菜单标题)
- `routePath`: 前端路由路径
- `permissionCode`: 权限标识
- `sort`: 排序值

### 3.2 后端 API (Backend)

在 `apps/app-api` 的 `Auth` 模块新增两个接口：

#### A. 获取权限列表 (`GET /api/sys/auth/permissions`)

- **返回**: `string[]` (当前用户拥有的所有权限编码列表)
- **用途**: 前端用于全局路由守卫 (Guard) 和按钮级细粒度控制。

#### B. 获取导航菜单 (`GET /api/sys/auth/nav`)

**参考实现**: `apps/admin-api` 中的 `PermissionService.tree()` 方法 ([code](file:///Users/yukkuri/Documents/workspace/personal/goi/apps/admin-api/src/modules/app/permission/permission.service.ts#L25)) 提供了树形构建的基础逻辑。

**差异对比**:
| 特性 | `admin-api` 的 `tree()` | 需要实现的 `app-api` 的 `nav()` |
| :--- | :--- | :--- |
| **用途** | 角色授权选择器 (Role Management) | 用户侧边栏导航 (Sidebar Navigation) |
| **数据内容** | 包含所有模块 + 所有细粒度权限 (按钮级) | 仅包含模块 (页面级) |
| **结构** | 混合了 Module 节点和 Permission 节点 | 纯 Module 节点 |
| **过滤逻辑** | 无过滤 (展示全量供管理员勾选) | **强过滤** (只展示用户有权访问的模块) |
| **返回值** | `key`, `title`, `type` (用于 Antd Tree) | `path`, `name`, `permissionCode` |

**逻辑**:

1.  获取当前用户的所有权限列表。
2.  查询所有 `AppModule` (按 `sort` 排序)。
3.  **过滤**: 仅保留 `permissionCode` 存在于用户权限列表中的模块 (若模块无权限要求则默认保留)。
4.  **组装**: 构建树形结构 (参考 `buildTree` 递归逻辑)。

- **返回**: `NavMenuTree[]`

### 3.3 前端架构 (Frontend)

#### A. 清理旧逻辑

- 删除 `apps/app/src/utils/route-tree.ts` (前端不再生成树)。
- 精简 `apps/app/src/router.d.ts`: `StaticData` 只保留 `{ permission: string }`。
- 清理 `routes/*.tsx`: 移除 `staticData` 中的 `name`, `icon` 等 UI 配置。

#### B. 图标映射 (Icon Mapping)

在前端维护静态映射表，根据 `permissionCode` 或 `routePath` 匹配图标。

```typescript
// apps/app/src/config/menu-icons.tsx
export const MENU_ICONS: Record<string, React.ReactNode> = {
  "dashboard:view": <LayoutDashboard />,
  "/settings": <Settings />,
}
```

#### C. 根加载器 (Root Loader)

在 `apps/app/src/routes/__root.tsx` 的 `beforeLoad` 或 `loader` 中并发获取：

1.  **User**: 基本用户信息。
2.  **Permissions**: 存入 Context，用于守卫。
3.  **NavTree**: 存入 Context，用于 Sidebar 渲染。

#### D. 路由守卫 (Guard)

在 `__root.tsx` 组件层使用 `useMatches` 进行全局拦截：

```typescript
const matches = useMatches()
const { permissions } = useRouteContext()
// 检查当前匹配的所有路由，若 staticData.permission 不在 permissions 中，则拦截
```

## 4. 执行计划

1.  **Contract**: 定义新的 API 响应类型 `NavMenuTree`。
2.  **Backend**: 实现 `app-api` 的 `permissions` 和 `nav` 接口。
3.  **Frontend**: 移除旧代码，实现 Icon 映射，对接新 API，重构 Sidebar 和守卫逻辑。
