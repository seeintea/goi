# Admin 前端架构：Feature 与路由对齐规范

## 背景 (Context)

`apps/admin` 应用作为系统的统一管理后台，实际上承载了两类截然不同的业务领域：

1.  **ToC 业务管理 (ToC Business Management)**：管理 App 端产生的数据（例如：App 用户管理、订单管理）。
2.  **ToB 系统管理 (ToB System Management)**：管理 Admin 后台系统本身（例如：管理员账号、角色权限配置）。

在此决策之前，项目的目录结构存在“路由按功能组织”与“Feature 按数据归属组织”的不匹配问题，导致代码导航困难，心智模型不统一。

## 决策：双领域架构 (Dual-Domain Structure)

我们决定采用 **“双领域架构 (Dual-Domain Architecture)”**，强制实施 **关注点分离**，并确保 **路由与 Feature 目录结构的 1:1 严格映射**。

### 1. 路由命名空间分离 (Route Namespace Separation)

路由在顶层严格划分为两个独立的命名空间：

- `/app/*`：专用于 **ToC 业务数据** 的管理与运营。
- `/system/*`：专用于 **ToB 后台系统** 自身的配置与维护。

### 2. Feature 目录对齐 (Feature Directory Alignment)

`src/features` 目录结构必须严格镜像路由结构。这能降低认知负担，实现“看到 URL 就能找到代码”的效果。

**目录结构示例：**

```text
src/features/
├── app/                  # ToC 业务域 (App Business)
│   ├── users/            # 对应路由 /app/users
│   ├── orders/           # 对应路由 /app/orders
│   └── ...
└── system/               # ToB 系统域 (Admin System)
    ├── administrators/   # 对应路由 /system/administrators
    ├── roles/            # 对应路由 /system/roles
    └── ...
```

### 3. API 组织策略 (API Organization)

为了支持跨功能复用，同时保持领域边界，API 定义依然按 **实体 (Entity)** 集中管理，而不是分散到各个 Feature 中。

- **位置**：`src/api/service/*`
- **策略**：按 **资源实体**（如 `app/user.ts`, `admin/role.ts`）组织，而不是按页面组织。
- **收益**：允许 `system/` 下的功能在必要时调用 `app/` 的数据接口（例如：管理员审计日志中引用了 App 用户信息），避免代码重复。

## 变更总结 (Summary of Changes)

| 层级 (Layer)            | ToC 业务域 (App Domain) | ToB 系统域 (System Domain) |
| :---------------------- | :---------------------- | :------------------------- |
| **路由 (Routes)**       | `/app/*`                | `/system/*`                |
| **功能模块 (Features)** | `src/features/app/*`    | `src/features/system/*`    |
| **API 定义 (API)**      | `src/api/service/app/*` | `src/api/service/admin/*`  |
