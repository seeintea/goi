import type { AuditLog, auditLogListQuerySchema, PageResult } from "@goi/contracts"
import { createServerFn } from "@tanstack/react-start"
import type { z } from "zod"
import { serverFetch } from "../client"

export type AuditLogListQuery = z.infer<typeof auditLogListQuerySchema>
export type { AuditLog }

const listAuditLogsFnBase = createServerFn({ method: "GET" }).handler(async (ctx: { data: unknown }) => {
  const query = ctx.data as AuditLogListQuery | undefined
  const params = new URLSearchParams()
  if (query && typeof query === "object") {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })
  }
  return await serverFetch<PageResult<AuditLog>>(`/api/system/audit-logs/list?${params}`, {
    method: "GET",
  })
})

export const listAuditLogs = listAuditLogsFnBase as unknown as (ctx: {
  data: AuditLogListQuery | undefined
}) => Promise<PageResult<AuditLog>>
