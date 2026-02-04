## finances 通用 CRUD 交互页面约定

### 交互 UI 组件选型约定

目标：减少重复实现、保证一致性，并让后续重构更可控。

优先级（从高到低）：

1. 优先使用 `packages/finances/src/components/base` 下的组件（业务侧封装，交互约束更完整）
2. 其次使用 `packages/finances/src/components/ui` 下的组件（基础 UI 组件层）
3. 如果都没有，再去 shadcn-ui 查找是否已有同类组件/交互范式
4. 仍然没有才自己实现（并优先沉淀到 `components/base` 或 `components/ui`，而不是散落在 feature 内）

### 表单提交中的 pending 行为

以 `packages/finances/src/features/role/components/create-dialog.tsx` 为例：

- 必须防止重复提交：提交按钮在 `pending` 期间禁用（保留 `disabled={isPending}`）。
- `pending` 期间不允许关闭弹窗：在 `onOpenChange` 中拦截关闭（`if (isPending) return`）。
- 输入框是否禁用属于可选优化：从正确性角度不是必须；如果禁用会影响可编辑性与可访问性（Tab 流程）。

推荐默认策略：

- 只禁用“提交按钮”，不禁用输入框。
- 保持“pending 不能关”，直到请求成功/失败返回。

### Create/Edit Dialog 的表单 UI 合并约定

目标：降低重复代码，但不强行统一 open/trigger/数据流。

推荐做法：

- 保留 `CreateDialog` 与 `EditDialog` 两个对外组件（一个常见是自带 trigger + 内部 open；另一个常见是受控 open + 依赖当前行数据）。
- 抽取共享的“表单 UI 层”组件（例如 `RoleFormDialog` / `UpsertForm`），只负责字段、校验、布局、提交按钮等可复用部分。
- `pending` 行为遵循本页约定：只禁用提交按钮，且 `pending` 期间不能关闭弹窗。

不做的事：

- 不把“create 的 trigger/内部 open 管理”和“edit 的受控 open/选中行状态管理”强行合并到一个组件里，避免出现大量互斥 props 与受控/非受控混用。

### 列表页 actions 与 busy 行为

以 `packages/finances/src/features/role/index.tsx` 与 `packages/finances/src/features/role/columns.tsx` 为例：

- `columns` 不需要因全局 `busy` 重算：尽量让列定义稳定，避免把 `isBusy` 作为列定义入参。
- 行操作是否禁用取决于风险承受：
  - 对“启用/禁用”这类轻量操作，可以接受并发/乱序带来的最终状态不确定时，可以不做全局禁用。
  - 对“删除”这类重操作，统一采用二次确认；确认后进入 `pending` 覆盖层，并保持 `pending` 期间不能关闭，以避免重复触发。

当前取舍：

- 目前可以接受行操作带来的并发/乱序风险，因此倾向于不做全局 `isBusy` 禁用。

### 列表页分页状态约定

目标：让分页状态的写法可复用、可读，并减少页面内重复逻辑。

推荐做法：

- 统一使用 `usePagination` 维护 `page`/`pageSize` 及其变更行为，并把 `pagination` 对象直接传给 `DataTable`。
- `total` 仍从接口返回数据中获取（例如 `data?.total ?? 0`），作为 `usePagination` 的入参来源。

页面层建议只保留：

- 列表查询入参：从 `usePagination` 读取 `page`/`pageSize`（或直接使用 hook 返回的 `query`）。
- `total` 注入：从 `data` 派生并传入 `usePagination`。
