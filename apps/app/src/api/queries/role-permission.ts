import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { CreateRolePermission, RolePermissionListQuery } from "../service/role-permission"
import {
  createRolePermission,
  deleteRolePermission,
  findRolePermission,
  listRolePermissions,
} from "../service/role-permission"

export const rolePermissionKeys = {
  all: ["role-permission"] as const,
  lists: () => [...rolePermissionKeys.all, "list"] as const,
  list: (query?: RolePermissionListQuery) => [...rolePermissionKeys.all, "list", query ?? null] as const,
  find: (roleId: string, permissionId: string) => [...rolePermissionKeys.all, "find", roleId, permissionId] as const,
}

export function useRolePermissionList(query?: RolePermissionListQuery) {
  return useQuery({
    queryKey: rolePermissionKeys.list(query),
    queryFn: async () => {
      const resp = await listRolePermissions({ data: query })
      return resp
    },
  })
}

export function useRolePermission(roleId: string, permissionId: string) {
  return useQuery({
    queryKey: rolePermissionKeys.find(roleId, permissionId),
    queryFn: async () => {
      const resp = await findRolePermission({ data: { roleId, permissionId } })
      return resp
    },
    enabled: Boolean(roleId) && Boolean(permissionId),
  })
}

export function useCreateRolePermission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateRolePermission) => {
      const resp = await createRolePermission({ data: body })
      return resp
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolePermissionKeys.lists() })
    },
  })
}

export function useDeleteRolePermission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateRolePermission) => {
      const resp = await deleteRolePermission({ data: body })
      return resp
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolePermissionKeys.lists() })
    },
  })
}
