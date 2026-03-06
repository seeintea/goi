import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { RoleListQuery } from "../common/role"
import { createRoleFn, deleteRoleFn, listRolesFn, updateRoleFn } from "../server/role"
import type { CreateAppRole, UpdateAppRole } from "@goi/contracts"

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

export function useCreateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAppRole) => createRoleFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() })
    },
  })
}

export function useUpdateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateAppRole) => updateRoleFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() })
    },
  })
}

export function useDeleteRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (roleId: string) => deleteRoleFn({ data: roleId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() })
    },
  })
}
