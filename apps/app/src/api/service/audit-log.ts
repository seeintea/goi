import { type AuditLog, auditLogListQuerySchema } from "@goi/contracts"
import type { z } from "zod"
import { api } from "@/api/client"
import type { PageResult } from "@/types/api"

export type AuditLogListQuery = z.infer<typeof auditLogListQuerySchema>
export type { AuditLog }

export const listAuditLogs = (query?: AuditLogListQuery) =>
  api.get<PageResult<AuditLog>>("/api/system/audit-logs/list", query)
