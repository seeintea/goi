import { keepPreviousData, useQuery } from "@tanstack/react-query"
import type { RoleListQuery } from "../common/role"
import { listRolesFn } from "../server/role"

export const roleKeys = {
  all: ["role"] as const,
  lists: () => [...roleKeys.all, "list"] as const,
  list: (query?: RoleListQuery) => [...roleKeys.all, "list", query ?? null] as const,
}

export function useRoleList(query?: RoleListQuery) {
  return useQuery({
    queryKey: roleKeys.list(query),
    queryFn: () => listRolesFn({ data: query }),
    placeholderData: keepPreviousData,
  })
}
