## API 分层约定（service / queries）


目标：让“请求定义”与“缓存策略/React 集成”解耦，降低后续维护与迁移成本，同时保持实现足够轻量。

### 分层边界

#### service（请求层）

职责：

- 只负责“接口调用本身”：路径、method、query/body、返回类型。
- 以纯函数形式导出：`(params) => Promise<Resp<T>>`（或项目现有的 `api.get/post` 返回类型）。
- 类型（Entity/DTO）与调用函数放在同一文件，保证接口签名聚合。

不做的事：

- 不在这里写 `useQuery/useMutation`。
- 不做缓存更新、失效策略、分页状态管理等。
- 不引入 React 依赖。

目录建议：

- `packages/finances/src/api/service/<module>.ts`

对照当前结构：现有 `packages/finances/src/api/controllers/<module>.ts` 可以逐步迁移为 `service`（先改新增 API 的放置位置即可，不强求一次性迁完）。

#### queries（缓存/Hook 层）

职责：

- 只负责 React Query 的集成：`queryKeys`、`useQuery/useMutation`、失效策略（invalidate）、必要时的缓存同步（setQueryData）。
- 不直接拼 URL，不直接触碰 API client；通过调用 `service` 暴露的方法完成请求。

目录建议：

- `packages/finances/src/api/queries/<module>.ts`

对照当前结构：现有 `packages/finances/src/api/react-query/<module>.ts` 可以逐步迁移为 `queries`。

### 命名规范（以 module 为例）

#### service 文件

- 文件：`service/module.ts`
- 类型：`Module`、`CreateModule`、`UpdateModule`、`ModuleListQuery`
- 调用函数：`createModule` / `findModule` / `listModules` / `updateModule` / `deleteModule`

#### queries 文件

- 文件：`queries/module.ts`
- queryKey 对象：`moduleKeys`
  - `all: ["module"]`
  - `list(query?)` / `find(id)` 等在 `all` 下扩展
- hooks：`useModuleList` / `useModule` / `useCreateModule` / `useUpdateModule` / `useDeleteModule`

### 文件组织建议

推荐保持“一个领域一个文件”，避免过度拆分：

- `service/module.ts`：聚合 module 相关 DTO + 请求函数
- `queries/module.ts`：聚合 module 相关 keys + hooks

当某个领域开始出现明显的复杂度（例如包含多种列表、树形、权限联动、复杂筛选、infinite query），再考虑在该领域下做小范围拆分：

- `queries/module.keys.ts`
- `queries/module.queries.ts`
- `queries/module.mutations.ts`

### 导出约定

为了让调用方入口统一：

- `packages/finances/src/api/service/index.ts` 统一 export service 层能力
- `packages/finances/src/api/queries/index.ts` 统一 export queries 层能力

新增 API 时只需要：

- 在 `service/<module>.ts` 增加请求函数与类型
- 在 `queries/<module>.ts` 增加 keys 与 hooks（如果页面需要）

### CRUD 后刷新与 queryKey 约定

目标：CRUD 完成后，用户正在查看的列表数据必须一致；同时避免“看似写了刷新但实际没刷新”的失效匹配问题。

#### 默认刷新策略

- Create / Update / Delete 成功后，默认让该领域下的“列表集合 key”失效（invalidate），保证当前列表会刷新。
- Update 成功后，额外让对应的 `find(id)` 失效，保证详情一致。
- 仅当能确定不会破坏排序/筛选语义时，才允许用 `setQueryData` 直接改缓存替代 refetch。

#### queryKey 设计原则

列表类 queryKey 必须包含“决定列表内容”的全部维度：

- 分页：`page` / `pageSize`
- 筛选：例如 `name` / `code` / `status`
- 排序：例如 `sortBy` / `order`

不应该包含与数据无关的 UI 状态：

- 弹窗开关、选中行、列显隐等

#### 列表 key 必须有“前缀集合 key”

为了能在 mutation 成功后“一次失效刷新所有列表变体”，keys 需要同时提供：

- 列表集合 key：用于失效刷新所有列表变体（不同分页/筛选/排序）
- 具体列表 key：用于缓存与按需精确失效（exact）

以 module 为例，推荐形状：

- `lists(): ["module", "list"]`
- `list(query?): ["module", "list", query ?? null]`

`invalidateQueries({ queryKey: lists() })` 能匹配并刷新：

- `["module", "list", null]`
- `["module", "list", { page: 1, pageSize: 10 }]`
- `["module", "list", { page: 2, name: "x" }]`

避免的误用：

- 不要用 `list()`（即 `["module","list",null]`）当作“列表集合 key”，它无法匹配 `["module","list", { ... }]` 这种真实列表缓存。
