import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { CreateRole, RoleListQuery, UpdateRole } from "../service/role"
import { createRole, deleteRole, findRole, listRoles, updateRole } from "../service/role"

export const roleKeys = {
  all: ["role"] as const,
  lists: () => [...roleKeys.all, "list"] as const,
  list: (query?: RoleListQuery) => [...roleKeys.all, "list", query ?? null] as const,
  find: (roleId: string) => [...roleKeys.all, "find", roleId] as const,
}

export function useRoleList(query?: RoleListQuery) {
  return useQuery({
    queryKey: roleKeys.list(query),
    queryFn: async () => {
      const resp = await listRoles({ data: query })
      return resp
    },
  })
}

export function useRole(roleId: string) {
  return useQuery({
    queryKey: roleKeys.find(roleId),
    queryFn: async () => {
      const resp = await findRole({ data: roleId })
      return resp
    },
    enabled: Boolean(roleId),
  })
}

export function useCreateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateRole) => {
      const resp = await createRole({ data: body })
      return resp
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() })
    },
  })
}

export function useUpdateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UpdateRole) => {
      const resp = await updateRole({ data: body })
      return resp
    },
    onSuccess: (role) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: roleKeys.find(role.roleId) })
    },
  })
}

export function useDeleteRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (roleId: string) => {
      const resp = await deleteRole({ data: roleId })
      return resp
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() })
    },
  })
}
