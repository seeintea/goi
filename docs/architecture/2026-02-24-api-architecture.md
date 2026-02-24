# API 分层架构设计 (2026-02-24)

本文档描述了 App 端的 API 架构重构方案。该方案采用 **依赖注入 (Dependency Injection)** 和 **策略模式 (Strategy Pattern)**，实现了业务逻辑与运行环境（Browser vs Node.js）的彻底解耦。

## 1. 核心层 (Core) - 定义与策略

核心层定义了统一的请求接口规范，并针对不同运行环境提供了具体的实现策略。

### 1.1 接口定义

```typescript
// src/api/core/types.ts

export type RequestConfig = RequestInit & {
  // 可在此扩展配置，如超时时间、重试次数等
}

// 统一的请求函数签名，不依赖具体库（Fetch/Axios）
export type RequestFn = <T>(url: string, config?: RequestConfig) => Promise<T>
```

### 1.2 客户端策略 (Client Strategy)

适用于浏览器环境，使用 `fetch` 并从 Zustand Store 获取 Token。

```typescript
// src/api/core/client.ts
import { useUser } from "@/stores/useUser"
import type { RequestFn } from "./types"

export const clientRequest: RequestFn = async (url, config = {}) => {
  const token = useUser.getState().token
  const headers = new Headers(config.headers)
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  // 浏览器端直接请求
  const response = await fetch(url, { ...config, headers })

  if (!response.ok) {
    if (response.status === 401) {
      useUser.getState().reset()
      // 处理重定向到登录页
    }
    throw new Error(`Client Request Failed: ${response.statusText}`)
  }

  return response.json()
}
```

### 1.3 服务端策略 (Server Strategy)

适用于 Node.js 环境（SSR/Loader），从 Cookie Session 获取 Token。

```typescript
// src/api/core/server.ts
import { getAppSession } from "@/utils/server/session.server"
import type { RequestFn } from "./types"

export const serverRequest: RequestFn = async (url, config = {}) => {
  const session = await getAppSession()
  const token = session.data?.accessToken
  
  const headers = new Headers(config.headers)
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  // 服务端请求通常需要绝对路径
  const baseURL = process.env.API_BASE_URL || "http://localhost:3000"
  const fullURL = url.startsWith("http") ? url : `${baseURL}${url}`

  const response = await fetch(fullURL, { ...config, headers })

  if (!response.ok) {
    throw new Error(`Server Request Failed: ${response.statusText}`)
  }

  return response.json()
}
```

---

## 2. 通用层 (Common) - 纯业务逻辑

通用层包含**纯粹的业务定义**。它不直接引入任何环境相关的代码，而是通过参数接收 `RequestFn`。这使得业务逻辑可以在任何环境复用。

```typescript
// src/api/common/transaction.ts
import type { RequestFn } from "../core/types"
import type { Transaction, CreateTransaction, PageResult } from "@goi/contracts"

// 工厂模式：注入 request 策略，返回具体的 API 方法集合
export const createTransactionApi = (request: RequestFn) => ({
  
  create: (data: CreateTransaction) => {
    return request<Transaction>("/api/transactions/create", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" }
    })
  },

  list: (query?: any) => {
    const params = new URLSearchParams(query)
    return request<PageResult<Transaction>>(`/api/transactions/list?${params}`)
  },

  delete: (id: string) => {
    return request<boolean>("/api/transactions/delete", {
      method: "POST",
      body: JSON.stringify({ id }),
      headers: { "Content-Type": "application/json" }
    })
  }
})
```

---

## 3. 服务端层 (Server Functions) - SSR 支持

服务端层负责将通用 API 包装为 TanStack Start 的 `createServerFn`，用于路由加载器 (Loader) 或 RPC 调用。

```typescript
// src/api/service/transaction.ts
import { createServerFn } from "@tanstack/react-start"
import { serverRequest } from "../core/server"
import { createTransactionApi } from "../common/transaction"

// 1. 使用服务端策略实例化 API
const api = createTransactionApi(serverRequest)

// 2. 包装为 Server Function (用于 SSR Loader)
export const listTransactionsFn = createServerFn({ method: "GET" })
  .handler(async ({ data }) => {
    return api.list(data)
  })
```

---

## 4. 查询层 (Queries) - 客户端 Hooks

查询层负责将通用 API 集成到 TanStack Query 中，用于组件内的数据获取和交互。

```typescript
// src/api/queries/transaction.ts
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { clientRequest } from "../core/client"
import { createTransactionApi } from "../common/transaction"

// 1. 使用客户端策略实例化 API
// 这个实例直接在浏览器运行，无需经过 Node 中间层
const api = createTransactionApi(clientRequest)

// 2. 定义 Query Options
export const transactionListOptions = (query?: any) => queryOptions({
  queryKey: ["transaction", "list", query],
  queryFn: () => api.list(query), // 直接调用 clientRequest
})

// 3. 定义 Mutations
export function useCreateTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transaction", "list"] })
    },
  })
}
```

## 总结

这种分层架构的优势：
1.  **环境解耦**：核心业务逻辑 (`Common`) 不依赖 Browser 或 Node 环境。
2.  **灵活替换**：如果未来需要将 `fetch` 替换为 `axios`，只需修改 `Core` 层的一处代码。
3.  **性能优化**：客户端交互（如点击按钮）直接请求后端，不再经过 Node Server 代理。
4.  **复用性**：同一套 API 定义同时服务于 SSR Loader 和 Client Hooks。
