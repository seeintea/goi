# apps/app SSR 改造方案

## 背景

`apps/app` 项目正在从 SPA (Single Page Application) 架构迁移至 SSR (Server-Side Rendering) 架构。为了确保服务端渲染的正确性、SEO 友好性以及避免 Hydration Mismatch（水合不匹配）问题，需要对现有的 Hooks 和 Layout 组件进行深度改造。

## 核心原则

1.  **服务端/客户端一致性**：确保服务端生成的 HTML 结构与客户端初次渲染的结构完全一致。
2.  **数据前置**：数据获取应通过 Router Loaders 在服务端完成，通过 Context 传递，而非在组件内部使用 `useEffect` 异步获取。
3.  **无副作用渲染**：组件渲染过程中不应直接访问 `window`、`document` 或 `localStorage`。

## Hooks 改造计划 (`apps/app/src/hooks`)

### 1. `use-head.ts`

- **现状**：使用 `useEffect` 和 `document.title` 在客户端动态修改标题。
- **问题**：SSR 模式下服务端无法执行 `useEffect`，导致输出 HTML 缺失标题，影响 SEO 和用户体验。
- **改造方案**：**废弃此 Hook**。
  - 使用 TanStack Router 的 `meta` 或 `head` 路由配置功能。
  - 在路由文件中定义静态或动态的 Meta 信息，服务端即可直接注入。

### 2. `use-route-tree.ts`

- **现状**：
  - 使用 `nanoid()` 为菜单项生成随机 ID。
  - 在组件内部通过 `useEffect` 或 `useMemo` 实时计算路由树。
- **问题**：
  - **水合不匹配**：服务端和客户端生成的随机 ID 不一致。
  - **重复计算**：每次组件渲染都会触发计算逻辑，虽然 JS 性能尚可，但这是不必要的消耗。
- **改造方案**：**废弃 Hook，转为纯函数 + Router Context**。
  - **重构逻辑**：将 `useRouteTree` 内部逻辑抽取为纯函数 `buildRouteTree(routeTree, permissions)`，放置在 `apps/app/src/utils/route-tree.ts` (或其他合适位置)。
  - **ID 确定性**：移除 `nanoid`，改用路由 `fullPath` 或 `id` 作为唯一 Key。
  - **数据流转**：
    - 在 Root Route (`__root.tsx`) 的 `beforeLoad` 或 `loader` 中调用 `buildRouteTree`。
    - 将计算好的 `menuTree` 注入 `RouterContext`。
    - 组件通过 `useRouter().options.context.menuTree` 直接消费数据。

### 3. `use-pagination.ts`

- **现状**：使用 `useState` 内部管理页码状态。
- **问题**：页面刷新后状态丢失，不利于 SSR 场景下的链接分享和状态保持。
- **改造方案**：**改为 URL Search Params 驱动**。
  - 移除内部 State，改为从 URL 参数读取 (`?page=1&size=10`)。
  - 配合 TanStack Router 的 `validateSearch` 验证参数。
  - 服务端可直接根据 URL 参数预加载对应页码数据。

### 4. `use-mobile.ts`

- **现状**：检测 `window.innerWidth`。
- **问题**：服务端无 `window` 对象，默认值可能导致 Hydration Mismatch。
- **改造方案**：**锁定为 PC 模式**。
  - **策略**：暂时不考虑移动端适配，Hook 永远返回 `false` (PC)。
  - **优势**：
    - 消除 SSR Hydration Mismatch。
    - 兼容 Shadcn 组件接口。
    - 简化逻辑，无需 `<ClientOnly>` 或 User-Agent 嗅探。

## Layout 改造计划 (`apps/app/src/layout`)

### 1. `header.tsx`

- **现状**：直接读取 `useUser` (Zustand + LocalStorage) 获取用户信息。
- **问题**：服务端无法读取 LocalStorage，导致渲染出的用户信息为空，客户端读取后跳变，引发 Hydration Error。
- **改造方案**：**变更数据源**。
  - 在 Root Route (`__root.tsx`) 的 `loader` 或 `beforeLoad` 中，由服务端解析 Cookie 获取用户信息。
  - 通过 `RouteContext` 将用户信息传递给组件。
  - `Header` 组件改为从 `useRouteContext()` 获取数据，实现服务端直出。

### 2. `sidebar.tsx`

- **现状**：依赖 `use-route-tree` Hook；折叠状态可能仅存留在客户端。
- **问题**：ID 不一致导致渲染问题；折叠状态服务端不可知。
- **改造方案**：
  - **数据源变更**：不再调用 `useRouteTree` Hook，改为直接读取 `useRouter().options.context.menuTree`。
  - **状态同步**：(进阶) 将 Sidebar 折叠状态存入 Cookie，以便服务端渲染时即应用正确的展开/折叠样式。

### 3. `index.tsx` (Layout 入口)

- **现状**：在组件内通过 `pathname` 判断是否显示 Layout。
- **改造方案**：**利用文件路由特性**。
  - 使用 `_auth` (Layout Route) 包裹需登录页面。
  - 将登录页置于 Layout Route 之外。
  - 移除硬编码的路径判断逻辑，通过路由结构自然分层。
