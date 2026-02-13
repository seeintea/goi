import {
  type AuditLogListQuery,
  listAuditLogs,
} from "../service/audit-log"
import { queryOptions, useQuery } from "@tanstack/react-query"

export const auditLogKeys = {
  all: ["audit-log"] as const,
  lists: () => [...auditLogKeys.all, "list"] as const,
  list: (query?: AuditLogListQuery) => [...auditLogKeys.all, "list", query ?? null] as const,
}

export const auditLogListOptions = (query?: AuditLogListQuery) =>
  queryOptions({
    queryKey: auditLogKeys.list(query),
    queryFn: () => listAuditLogs(query),
  })

export function useAuditLogList(query?: AuditLogListQuery) {
  return useQuery(auditLogListOptions(query))
}
